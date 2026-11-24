import assert from 'node:assert/strict';
import { after, afterEach, beforeEach, test } from 'node:test';
import {
  computed,
  createRenderer,
  h,
  nextTick,
  reactive,
  ref,
  toRef,
} from 'vue';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
});
after(() => server.close());
const load = (name) =>
  server.ssrLoadModule(`/src/components/table-entity/composables/${name}.ts`);
const { useColumnSettings } = await load('use-column-settings');
const { useColumnFixed } = await load('use-column-fixed');
const { useColumnResize } = await load('use-column-resize');
const { useTablePersistence } = await load('use-table-persistence');
const { setupDisguise } = await server.ssrLoadModule('/src/setup.ts');

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
let storage;
const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
beforeEach(() => {
  setupDisguise({ storageKey: '' });
  storage = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
  };
});
afterEach(() => {
  for (const app of apps.splice(0)) app.unmount();
  setupDisguise({ storageKey: '' });
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
  if (originalDocument === undefined) delete globalThis.document;
  else globalThis.document = originalDocument;
});
const key = (name) => `disguise-ui:table-entity:${name}`;
const columns = () => [
  {
    key: 'name',
    title: 'Name',
    width: 120,
    align: 'center',
    headerAlign: 'right',
  },
  { key: 'age', title: 'Age', width: 80 },
];
function mount(input = {}, initialColumns = columns()) {
  const props = reactive(input);
  const source = ref(initialColumns);
  let api;
  const app = renderer.createApp({
    setup() {
      const settings = useColumnSettings(source);
      const fixed = useColumnFixed(source);
      const resize = useColumnResize(30);
      const dimensions = useTablePersistence({
        storageKey: toRef(props, 'storageKey'),
        height: toRef(props, 'height'),
        rowHeight: toRef(props, 'rowHeight'),
        columns: source,
        settings,
        fixed,
        resize,
      });
      api = { settings, fixed, resize, ...dimensions };
      api.rendered = computed(() =>
        fixed.applyFixed(
          settings.applyAlign(
            resize.applyColumnWidths(settings.visibleColumns.value),
          ),
        ),
      );
      return () => h('div');
    },
  });
  app.mount({});
  apps.push(app);
  return {
    ...api,
    props,
    source,
    unmount: () => {
      app.unmount();
      apps.splice(apps.indexOf(app), 1);
    },
  };
}

test('all column preferences and dimensions survive a remount without mutating columns', async () => {
  const original = columns();
  const table = mount(
    { storageKey: 'users', height: '70%', rowHeight: 56 },
    original,
  );
  table.settings.reorderSettings(
    [...table.settings.orderedSettings.value].reverse(),
  );
  table.settings.toggleColumn('age');
  table.settings.setHeaderAlign('name', 'left');
  table.settings.setContentAlign('name', 'right');
  table.fixed.setFixed('name', 'right');
  table.resize.setWidth('name', 240);
  await nextTick();
  table.unmount();
  const restored = mount({ storageKey: 'users' });
  assert.equal(restored.height.value, '70%');
  assert.equal(restored.rowHeight.value, 56);
  assert.deepEqual(restored.settings.getState().orderedKeys, ['age', 'name']);
  assert.deepEqual(restored.settings.getState().hiddenKeys, ['age']);
  assert.deepEqual(
    restored.rendered.value.map(
      ({ key, width, align, headerAlign, fixed }) => ({
        key,
        width,
        align,
        headerAlign,
        fixed,
      }),
    ),
    [
      {
        key: 'name',
        width: 240,
        align: 'right',
        headerAlign: 'left',
        fixed: 'right',
      },
    ],
  );
  assert.deepEqual(original, columns());
});

test('explicit heights take precedence and later prop changes are saved', async () => {
  mount({ storageKey: 'users', height: 640, rowHeight: 48 }).unmount();
  const table = mount({ storageKey: 'users', height: '50%', rowHeight: 60 });
  assert.equal(table.height.value, '50%');
  assert.equal(table.rowHeight.value, 60);
  table.props.height = 500;
  table.props.rowHeight = 72;
  await nextTick();
  table.unmount();
  const restored = mount({ storageKey: 'users' });
  assert.equal(restored.height.value, 500);
  assert.equal(restored.rowHeight.value, 72);
});

test('async columns restore cached settings; new columns are visible and removed keys are ignored', async () => {
  const first = mount({ storageKey: 'async' });
  first.settings.toggleColumn('name');
  first.resize.setWidth('name', 200);
  first.fixed.setFixed('name', 'left');
  first.unmount(); // Flush even when unmounted before the watcher runs.
  const table = mount({ storageKey: 'async' }, []);
  await nextTick();
  assert.deepEqual(JSON.parse(storage.get(key('async'))).hiddenKeys, ['name']);
  table.source.value = [...columns(), { key: 'email', width: 140 }];
  await nextTick();
  assert.deepEqual(table.settings.getState().hiddenKeys, ['name']);
  assert.deepEqual(
    table.rendered.value.map((col) => col.key),
    ['age', 'email'],
  );
  assert.equal(table.resize.widthOverrides.name, 200);
  table.source.value = [{ key: 'email', width: 140 }];
  await nextTick();
  const saved = JSON.parse(storage.get(key('async')));
  assert.deepEqual(saved.orderedKeys, ['email']);
  assert.deepEqual(saved.hiddenKeys, []);
  assert.deepEqual(saved.widths, {});
});

test('keys isolate tables, can change dynamically and an omitted key disables storage', async () => {
  const table = mount({ storageKey: 'one' });
  table.settings.toggleColumn('name');
  table.resize.setWidth('age', 160);
  await nextTick();
  table.props.storageKey = 'two';
  await nextTick();
  assert.deepEqual(table.settings.getState().hiddenKeys, []);
  assert.deepEqual(table.resize.widthOverrides, {});
  table.settings.toggleColumn('age');
  await nextTick();
  table.props.storageKey = 'one';
  await nextTick();
  assert.deepEqual(table.settings.getState().hiddenKeys, ['name']);
  assert.equal(table.resize.widthOverrides.age, 160);
  assert.deepEqual(
    mount({ storageKey: 'two' }).settings.getState().hiddenKeys,
    ['age'],
  );
  const count = storage.size;
  const plain = mount();
  plain.settings.toggleColumn('name');
  await nextTick();
  assert.equal(storage.size, count);
  assert.deepEqual(mount().settings.getState().hiddenKeys, []);
});

test('reset clears persisted overrides, including column widths and alignment', async () => {
  const table = mount({ storageKey: 'reset' });
  table.resize.setWidth('name', 250);
  table.settings.setHeaderAlign('name', 'left');
  table.settings.setContentAlign('name', 'right');
  table.settings.toggleColumn('name');
  table.fixed.setFixed('name', 'left');
  await nextTick();
  table.settings.reset();
  table.fixed.reset();
  table.resize.reset();
  await nextTick();
  table.unmount();
  const [restored] = mount({ storageKey: 'reset' }).rendered.value;
  assert.equal(restored.width, 120);
  assert.equal(restored.align, 'center');
  assert.equal(restored.headerAlign, 'right');
  assert.equal(restored.fixed, undefined);
});

test('dragged widths persist and a subsequent panel width replaces them', async () => {
  const listeners = new Map();
  globalThis.document = {
    body: { style: {} },
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: (name) => listeners.delete(name),
  };
  const table = mount({ storageKey: 'drag' });
  table.resize.onViewportMouseDown({
    clientX: 119,
    preventDefault() {},
    stopPropagation() {},
    target: {
      closest: () => ({
        dataset: { key: 'name' },
        getBoundingClientRect: () => ({ left: 0, width: 120 }),
      }),
    },
  });
  listeners.get('mousemove')({ clientX: 199 });
  listeners.get('mouseup')();
  await nextTick();
  assert.equal(JSON.parse(storage.get(key('drag'))).widths.name, 200);
  table.resize.setWidth('name', 180);
  table.unmount();
  assert.equal(mount({ storageKey: 'drag' }).rendered.value[0].width, 180);
  assert.equal(listeners.size, 0);
});

test('invalid caches are filtered and damaged or unknown versions fall back to defaults', () => {
  for (const value of ['{', 'null', '[]', '{"version":99}']) {
    storage.set(key('bad'), value);
    const table = mount({ storageKey: 'bad' });
    assert.equal(table.height.value, '100%');
    assert.equal(table.rendered.value.length, 2);
    table.unmount();
  }
  storage.set(
    key('bad'),
    JSON.stringify({
      version: 1,
      height: 'abc',
      rowHeight: -1,
      orderedKeys: ['age', 'age', 'missing', 123],
      hiddenKeys: ['missing'],
      widths: { name: -100, age: '200' },
      headerAlign: { name: 'invalid' },
      contentAlign: { name: 'right' },
      fixed: { name: true, age: 'right' },
    }),
  );
  const table = mount({ storageKey: 'bad' });
  assert.deepEqual(
    table.rendered.value.map((col) => col.key),
    ['age', 'name'],
  );
  assert.equal(table.rendered.value[0].width, 80);
  assert.equal(table.rendered.value[0].fixed, 'right');
  assert.equal(table.rendered.value[1].headerAlign, 'right');
  assert.equal(table.rendered.value[1].align, 'right');
  assert.equal(table.height.value, '100%');
  assert.equal(table.rowHeight.value, 40);
});

test('SSR and blocked or full storage leave the table functional', async () => {
  delete globalThis.window;
  assert.equal(mount({ storageKey: 'ssr' }).rendered.value.length, 2);
  globalThis.window = {};
  Object.defineProperty(globalThis.window, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('Storage blocked');
    },
  });
  const blocked = mount({ storageKey: 'blocked' });
  blocked.settings.toggleColumn('name');
  await nextTick();
  assert.equal(blocked.rendered.value.length, 1);
  Object.defineProperty(globalThis.window, 'localStorage', {
    value: {
      getItem: () => null,
      setItem: () => {
        throw new Error('Quota exceeded');
      },
    },
  });
  const full = mount({ storageKey: 'full' });
  full.resize.setWidth('name', 220);
  await nextTick();
  assert.equal(full.rendered.value[0].width, 220);
});

test('global injection enables all tables and isolates pages and table schemas', async () => {
  setupDisguise({ storageKey: 'admin' });
  globalThis.window.location = { pathname: '/users', hash: '' };
  const users = mount();
  users.settings.toggleColumn('age');
  users.resize.setWidth('name', 210);
  await nextTick();
  users.unmount();
  const restored = mount();
  assert.deepEqual(restored.settings.getState().hiddenKeys, ['age']);
  assert.equal(restored.rendered.value[0].width, 210);
  // Source column order does not change the automatic identity.
  assert.deepEqual(
    mount({}, columns().reverse()).settings.getState().hiddenKeys,
    ['age'],
  );
  assert.deepEqual(
    mount({}, [{ key: 'department' }]).settings.getState().hiddenKeys,
    [],
  );
  globalThis.window.location.pathname = '/departments';
  assert.deepEqual(mount().settings.getState().hiddenKeys, []);
  assert.ok(
    [...storage.keys()].every((name) => name.startsWith(key('admin:'))),
  );
});

test('global keys support reactive account changes, getters, reinjection and disabling', async () => {
  const account = ref('alice');
  setupDisguise({ storageKey: account });
  const table = mount();
  table.settings.toggleColumn('name');
  await nextTick();
  account.value = 'bob';
  await nextTick();
  assert.deepEqual(table.settings.getState().hiddenKeys, []);
  table.resize.setWidth('age', 150);
  await nextTick();
  account.value = 'alice';
  await nextTick();
  assert.deepEqual(table.settings.getState().hiddenKeys, ['name']);
  assert.deepEqual(table.resize.widthOverrides, {});
  setupDisguise({});
  assert.deepEqual(mount().settings.getState().hiddenKeys, ['name']);
  setupDisguise({ storageKey: () => `app:${account.value}` });
  await nextTick();
  table.settings.toggleColumn('age');
  await nextTick();
  assert.deepEqual(mount().settings.getState().hiddenKeys, ['age']);
  setupDisguise({ storageKey: '' });
  await nextTick();
  const saved = new Map(storage);
  table.settings.toggleColumn('name');
  await nextTick();
  assert.deepEqual(storage, saved);
  assert.deepEqual(mount().settings.getState().hiddenKeys, []);
});

test('explicit table keys override global keys and an empty key opts out', async () => {
  setupDisguise({ storageKey: 'admin' });
  const explicit = mount({ storageKey: 'custom' });
  explicit.resize.setWidth('name', 190);
  await nextTick();
  assert.equal(JSON.parse(storage.get(key('custom'))).widths.name, 190);
  setupDisguise({ storageKey: 'another-account' });
  await nextTick();
  assert.equal(explicit.rendered.value[0].width, 190);
  const saved = new Map(storage);
  const disabled = mount({ storageKey: '' });
  disabled.settings.toggleColumn('age');
  disabled.resize.setWidth('name', 250);
  await nextTick();
  assert.deepEqual(storage, saved);
  assert.deepEqual(
    mount({ storageKey: '' }).settings.getState().hiddenKeys,
    [],
  );
});

test('mounted tables retain their own page scope when a global account prefix changes', async () => {
  setupDisguise({ storageKey: 'alice' });
  globalThis.window.location = { pathname: '/users', hash: '' };
  const users = mount();
  users.settings.toggleColumn('name');
  await nextTick();
  globalThis.window.location.pathname = '/departments';
  const departments = mount();
  departments.settings.toggleColumn('age');
  await nextTick();
  setupDisguise({ storageKey: 'bob' });
  await nextTick();
  assert.deepEqual(users.settings.getState().hiddenKeys, []);
  assert.deepEqual(departments.settings.getState().hiddenKeys, []);
  setupDisguise({ storageKey: 'alice' });
  await nextTick();
  assert.deepEqual(users.settings.getState().hiddenKeys, ['name']);
  assert.deepEqual(departments.settings.getState().hiddenKeys, ['age']);
});

test('globally persisted async columns restore and hash routes have separate configurations', async () => {
  setupDisguise({ storageKey: 'app' });
  globalThis.window.location = { pathname: '/', hash: '#/users?tab=list' };
  const first = mount();
  first.settings.toggleColumn('age');
  first.unmount();
  const table = mount({}, []);
  await nextTick();
  table.source.value = columns();
  await nextTick();
  assert.deepEqual(table.settings.getState().hiddenKeys, ['age']);
  // Later schema changes keep the mounted table's identity and preferences.
  table.source.value.push({ key: 'email' });
  await nextTick();
  assert.deepEqual(table.settings.getState().hiddenKeys, ['age']);
  globalThis.window.location.hash = '#/users?tab=other';
  assert.deepEqual(mount().settings.getState().hiddenKeys, ['age']);
  globalThis.window.location.hash = '#/departments';
  assert.deepEqual(mount().settings.getState().hiddenKeys, []);
});
