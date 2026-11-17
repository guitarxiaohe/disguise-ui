import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
import { createSSRApp, h, reactive, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
});
after(() => server.close());
const { setupDisguise } = await server.ssrLoadModule('/src/setup.ts');
const { getOnlineUserIds } = await server.ssrLoadModule(
  '/src/runtime/context.ts',
);
const { default: UserAvatarInfo } = await server.ssrLoadModule(
  '/src/components/user-avatar-info/index.vue',
);
afterEach(() => setupDisguise({ userOnline: [] }));

test('injected ref follows WebSocket snapshots, in-place updates and logout', () => {
  const userOnline = ref([]);
  setupDisguise({ userOnline });
  const ids = getOnlineUserIds();
  assert.equal(ids.value.size, 0);

  userOnline.value = [1, '2', 0];
  assert.deepEqual([...ids.value], ['1', '2', '0']);
  userOnline.value.push(3);
  assert.equal(ids.value.has('3'), true);
  userOnline.value.splice(0, 1);
  assert.equal(ids.value.has('1'), false);
  userOnline.value = [];
  assert.equal(ids.value.size, 0);
});

test('getter tracks replacement of a store list and reactive array mutations', () => {
  const store = reactive({ onlineIds: [1] });
  setupDisguise({ userOnline: () => store.onlineIds });
  const ids = getOnlineUserIds();
  assert.equal(ids.value.has('1'), true);
  store.onlineIds = [2];
  assert.deepEqual([...ids.value], ['2']);
  store.onlineIds.push(3);
  assert.equal(ids.value.has('3'), true);

  setupDisguise({ userOnline: store.onlineIds });
  store.onlineIds.push(4);
  assert.equal(ids.value.has('4'), true);
});

test('setup can replace the source, preserve it on unrelated calls and clear it', () => {
  const oldSource = ref([1]);
  setupDisguise({ userOnline: oldSource });
  const ids = getOnlineUserIds();
  setupDisguise({});
  oldSource.value = [2];
  assert.deepEqual([...ids.value], ['2']);

  setupDisguise({ userOnline: [3, '3', '003'] });
  oldSource.value = [4];
  assert.deepEqual([...ids.value], ['3', '003']);
  setupDisguise({ userOnline: [] });
  assert.equal(ids.value.size, 0);
});

test('avatars share injected presence without props and match string IDs and zero', async () => {
  const userOnline = ref([1, '0']);
  setupDisguise({ userOnline });
  async function render(userId) {
    return renderToString(
      createSSRApp({
        render: () => h(UserAvatarInfo, { userId, enableDrawer: false }),
      }),
    );
  }
  const onlineClass = /user-avatar-info__presence-badge--online/;
  assert.match(await render('1'), onlineClass);
  assert.match(await render(0), onlineClass);
  assert.doesNotMatch(await render(4), onlineClass);
  for (const userId of [undefined, null, '']) {
    assert.doesNotMatch(
      await render(userId),
      /class="user-avatar-info__presence-badge/,
    );
  }
  userOnline.value = [4];
  assert.doesNotMatch(await render(1), onlineClass);
  assert.match(await render(4), onlineClass);
  userOnline.value = [];
  assert.doesNotMatch(await render(4), onlineClass);
});
