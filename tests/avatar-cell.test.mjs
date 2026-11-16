import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import { createRenderer, h, nextTick, reactive } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
});
after(() => server.close());
const { setupDisguise } = await server.ssrLoadModule('/src/setup.ts');
const { useAvatarCell } = await server.ssrLoadModule(
  '/src/composables/use-avatar-cell.ts',
);
const { USER_DATA_ALL_QUERY_KEY } = await server.ssrLoadModule(
  '/src/runtime/user.ts',
);
const { applyColumnSlots } = await server.ssrLoadModule(
  '/src/components/table-entity/utils/column-slots.ts',
);

// Mount real Vue scopes and query observers without depending on a browser DOM.
const renderer = createRenderer({
  patchProp() {},
  insert() {},
  remove() {},
  createElement: () => ({}),
  createText: () => ({}),
  createComment: () => ({}),
  setText() {},
  setElementText() {},
  parentNode: () => null,
  nextSibling: () => null,
});
const apps = [];
const clients = [];
afterEach(() => {
  for (const app of apps.splice(0)) app.unmount();
  for (const client of clients.splice(0)) client.clear();
  setupDisguise({ fetchAllUserData: null, userLookupFields: {} });
});

function queryClient() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  clients.push(client);
  return client;
}

function mountCell(input, client) {
  const props = reactive(input);
  let data;
  const app = renderer.createApp({
    setup() {
      data = useAvatarCell(props);
      return () => h('div');
    },
  });
  if (client) app.use(VueQueryPlugin, { queryClient: client });
  app.mount({});
  apps.push(app);
  return { props, data };
}

async function until(condition) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    await nextTick();
    if (condition()) return;
    await setTimeout(1);
  }
  assert.fail('Reactive query did not reach the expected state');
}

const users = [
  { userId: 0, userName: 'zero', nickName: '零号用户' },
  {
    userId: 1,
    userName: 'admin',
    nickName: '管理员',
    avatar: '/admin.png',
    phone: '100',
    deptName: '研发',
  },
  { userId: 2, userName: 'editor', nickName: '编辑' },
];
function configure(fetchAllUserData = async () => users) {
  setupDisguise({
    fetchAllUserData,
    userLookupFields: {
      createBy: 'userName',
      updateBy: 'userName',
      userId: 'userId',
    },
  });
}

test('inline avatar data works without a query plugin, including old aliases and local overrides', () => {
  const { data } = mountCell({
    field: 'avatar',
    row: { userId: 3, userName: 'inline', avatar: '/inline.png', phone: '123' },
    cellProps: {
      nickName: '本地昵称',
      src: '/override.png',
      drawerFields: [{ key: 'phone' }],
    },
  });
  assert.deepEqual(data.value, {
    userId: 3,
    name: 'inline',
    nickName: '本地昵称',
    phone: '123',
    src: '/inline.png',
    drawerFields: [{ key: 'phone' }],
  });
  const avatar = { shape: 'square' };
  assert.deepEqual(mountCell({ row: { avatar } }).data.value.avatar, avatar);
});

test('unconfigured columns preserve the legacy merge-before-alias precedence', () => {
  const { props, data } = mountCell({
    field: 'avatar',
    row: { name: '行内姓名', userName: 'inline', avatar: '/row.png' },
    cellProps: { userName: 'override', src: '/cell.png' },
  });
  assert.equal(data.value.name, '行内姓名');
  assert.equal(data.value.src, '/row.png');
  props.cellProps.name = '覆盖姓名';
  props.cellProps.avatar = '/override.png';
  assert.equal(data.value.name, '覆盖姓名');
  assert.equal(data.value.src, '/override.png');

  const avatar = { shape: 'circle' };
  const legacy = mountCell({
    row: { avatar },
    cellProps: { avatarProps: { shape: 'square' } },
  });
  assert.deepEqual(legacy.data.value.avatar, avatar);
  legacy.props.cellProps.avatar = undefined;
  assert.deepEqual(legacy.data.value.avatar, { shape: 'square' });
});

test('the table passes the actual column field and value separately from row data and cellProps', () => {
  const row = { createBy: 'admin', userName: 'unrelated' };
  const seen = [];
  const [column] = applyColumnSlots(
    [
      {
        key: 'creator',
        dataKey: 'createBy',
        type: 'avatar',
        cellProps: (ctx) => {
          seen.push(ctx);
          return { size: 48 };
        },
      },
    ],
    {},
  );
  const rendered = column.cellRenderer({
    rowData: row,
    rowIndex: 2,
    cellData: 'admin',
    column,
  });
  const cell = rendered.children[0];
  assert.equal(cell.props.field, 'createBy');
  assert.equal(cell.props.value, 'admin');
  assert.equal(cell.props.row, row);
  assert.deepEqual(cell.props.cellProps, { size: 48 });
  assert.equal(row.size, undefined);
  assert.equal(seen[0].rowIndex, 2);
  assert.equal(seen[0].value, 'admin');

  const [alias] = applyColumnSlots(
    [
      {
        key: 'createBy',
        dataIndex: 'createBy',
        dataKey: 'createBy',
        type: 'avatar',
        props: { nickName: '覆盖' },
      },
    ],
    {},
  );
  const aliasCell = alias.cellRenderer({
    rowData: row,
    rowIndex: 0,
    column: alias,
  }).children[0];
  assert.equal(aliasCell.props.value, 'admin');
  assert.deepEqual(aliasCell.props.cellProps, { nickName: '覆盖' });
});

test('setup only registers the loader; unmapped and empty cells do not fetch', async () => {
  let calls = 0;
  configure(async () => {
    calls += 1;
    return users;
  });
  assert.equal(calls, 0);
  const client = queryClient();
  mountCell(
    { field: 'avatar', value: '/picture.png', row: { userName: 'inline' } },
    client,
  );
  for (const value of [null, undefined, '']) {
    const { data } = mountCell({ field: 'createBy', value }, client);
    assert.equal(data.value.name, '--');
    assert.equal(data.value.enableDrawer, false);
  }
  await nextTick();
  assert.equal(calls, 0);
});

test('creator and updater share one pending request and match userName instead of user.createBy', async () => {
  let calls = 0;
  let resolve;
  configure(() => {
    calls += 1;
    return new Promise((done) => {
      resolve = done;
    });
  });
  const client = queryClient();
  const creator = mountCell({ field: 'createBy', value: 'admin' }, client);
  const updater = mountCell({ field: 'updateBy', value: 'editor' }, client);
  assert.equal(calls, 1);
  assert.equal(creator.data.value.name, 'admin');
  assert.equal(creator.data.value.enableDrawer, false);
  resolve([
    { userName: 'wrong', createBy: 'admin', nickName: '错误用户' },
    ...users,
  ]);
  await until(
    () =>
      creator.data.value.nickName === '管理员' &&
      updater.data.value.nickName === '编辑',
  );
  assert.equal(creator.data.value.src, '/admin.png');
  assert.equal(creator.data.value.enableDrawer, true);
  assert.equal(calls, 1);
  assert.equal(client.getQueryCache().getAll()[0].getObserversCount(), 2);
});

test('reused virtual cells react to current values and fields without creating more observers', async () => {
  let calls = 0;
  configure(async () => {
    calls += 1;
    return users;
  });
  const client = queryClient();
  const { props, data } = mountCell(
    { field: 'createBy', value: 'admin' },
    client,
  );
  await until(() => data.value.nickName === '管理员');
  props.value = 'editor';
  assert.equal(data.value.nickName, '编辑');
  props.field = 'userId';
  props.value = '0';
  assert.equal(data.value.nickName, '零号用户');
  props.value = 0;
  assert.equal(data.value.userId, 0);
  props.value = null;
  assert.equal(data.value.name, '--');
  assert.equal(data.value.nickName, undefined);
  await nextTick();
  assert.equal(calls, 1);
  assert.equal(client.getQueryCache().getAll().length, 1);
  assert.equal(client.getQueryCache().getAll()[0].getObserversCount(), 1);
});

test('an initially empty cell begins loading when its value arrives', async () => {
  let calls = 0;
  configure(async () => {
    calls += 1;
    return users;
  });
  const { props, data } = mountCell(
    { field: 'createBy', value: '' },
    queryClient(),
  );
  assert.equal(calls, 0);
  props.value = 'admin';
  await until(() => data.value.nickName === '管理员');
  assert.equal(calls, 1);
});

test('associated users never inherit the business row identity or private display fields', async () => {
  configure();
  const row = {
    userId: 99,
    userName: 'unrelated',
    name: '业务名称',
    nickName: '其他人',
    avatar: '/wrong.png',
    email: 'wrong@example.test',
    phone: '999',
    deptName: '其他部门',
  };
  const { props, data } = mountCell(
    { field: 'createBy', value: 'admin', row },
    queryClient(),
  );
  assert.deepEqual(data.value, { name: 'admin', enableDrawer: false });
  await until(() => data.value.nickName === '管理员');
  assert.equal(data.value.userId, 1);
  assert.equal(data.value.phone, '100');
  assert.equal(data.value.email, undefined);
  props.value = 'deleted';
  assert.deepEqual(data.value, { name: 'deleted', enableDrawer: false });
  assert.equal(row.nickName, '其他人');
});

test('explicit cellProps override loaded user properties and remain reactive', async () => {
  configure();
  const { props, data } = mountCell(
    {
      field: 'createBy',
      value: 'admin',
      cellProps: {
        nickName: '自定义',
        src: '/local.png',
        phone: '222',
        enableDrawer: false,
        size: 48,
      },
    },
    queryClient(),
  );
  await until(() => data.value.userId === 1);
  assert.equal(data.value.nickName, '自定义');
  assert.equal(data.value.src, '/local.png');
  assert.equal(data.value.phone, '222');
  assert.equal(data.value.enableDrawer, false);
  assert.equal(data.value.size, 48);
  props.cellProps.nickName = '更新';
  assert.equal(data.value.nickName, '更新');
});

test('a mapped identity column preserves its own inline data and fills it from the user cache', async () => {
  configure();
  const { data } = mountCell(
    {
      field: 'userId',
      value: 1,
      row: { userId: 1, userName: 'admin', email: 'inline@example.test' },
    },
    queryClient(),
  );
  assert.equal(data.value.name, 'admin');
  await until(() => data.value.nickName === '管理员');
  assert.equal(data.value.email, 'inline@example.test');
  assert.equal(data.value.deptName, '研发');
});

test('missing loader or a failed request falls back to the original value with no wrong drawer', async () => {
  setupDisguise({ userLookupFields: { createBy: 'userName' } });
  assert.deepEqual(
    mountCell({ field: 'createBy', value: 'admin', row: { nickName: 'wrong' } })
      .data.value,
    { name: 'admin', enableDrawer: false },
  );
  configure(async () => {
    throw new Error('User data unavailable');
  });
  const client = queryClient();
  const { data } = mountCell({ field: 'createBy', value: 'admin' }, client);
  await until(
    () => client.getQueryCache().getAll()[0]?.state.status === 'error',
  );
  assert.deepEqual(data.value, { name: 'admin', enableDrawer: false });
});

test('refreshing user data updates every mounted avatar using the shared cache', async () => {
  let current = users;
  let calls = 0;
  configure(async () => {
    calls += 1;
    return current;
  });
  const client = queryClient();
  const first = mountCell({ field: 'createBy', value: 'admin' }, client);
  const second = mountCell({ field: 'updateBy', value: 'admin' }, client);
  await until(() => first.data.value.userId === 1);
  current = [{ userId: 1, userName: 'admin', nickName: '新昵称' }];
  await client.invalidateQueries({ queryKey: USER_DATA_ALL_QUERY_KEY });
  await until(
    () =>
      first.data.value.nickName === '新昵称' &&
      second.data.value.nickName === '新昵称',
  );
  assert.equal(calls, 2);
});

test('resetting for a new login clears display data and ignores a late result from the old session', async () => {
  let finishOld;
  let calls = 0;
  configure(() => {
    calls += 1;
    return calls === 1
      ? new Promise((resolve) => {
          finishOld = resolve;
        })
      : Promise.resolve([{ userName: 'admin', nickName: '新账号可见数据' }]);
  });
  const client = queryClient();
  const { data } = mountCell({ field: 'createBy', value: 'admin' }, client);
  await client.resetQueries({ queryKey: USER_DATA_ALL_QUERY_KEY });
  await until(() => data.value.nickName === '新账号可见数据');
  finishOld([{ userName: 'admin', nickName: '旧账号数据' }]);
  await setTimeout(5);
  assert.equal(data.value.nickName, '新账号可见数据');
  assert.equal(calls, 2);
});

test('replacing a loader changes the cache source while unrelated setup calls preserve it', async () => {
  let calls = 0;
  configure(async () => {
    calls += 1;
    return users;
  });
  const { data } = mountCell(
    { field: 'createBy', value: 'admin' },
    queryClient(),
  );
  await until(() => data.value.nickName === '管理员');
  setupDisguise({ locale: 'en-US' });
  await nextTick();
  assert.equal(data.value.nickName, '管理员');
  assert.equal(calls, 1);
  setupDisguise({
    fetchAllUserData: async () => [{ userName: 'admin', nickName: '新数据源' }],
  });
  await until(() => data.value.nickName === '新数据源');
  setupDisguise({ fetchAllUserData: null });
  await nextTick();
  assert.deepEqual(data.value, { name: 'admin', enableDrawer: false });
});

test('remounting avatars reuses fresh user data and prototype names are not accidental mappings', async () => {
  let calls = 0;
  configure(async () => {
    calls += 1;
    return users;
  });
  const client = queryClient();
  const first = mountCell({ field: 'createBy', value: 'admin' }, client);
  await until(() => first.data.value.nickName === '管理员');
  apps.pop().unmount();
  const second = mountCell({ field: 'createBy', value: 'admin' }, client);
  await until(() => second.data.value.nickName === '管理员');
  const inline = mountCell(
    { field: 'toString', value: 'admin', row: { userName: 'inline' } },
    client,
  );
  assert.equal(inline.data.value.name, 'inline');
  assert.equal(calls, 1);
});
