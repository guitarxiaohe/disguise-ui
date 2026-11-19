import assert from 'node:assert/strict';
import { after, afterEach, mock, test } from 'node:test';
import { createRenderer, h, nextTick, ref } from 'vue';
import { compileScript, parse } from 'vue/compiler-sfc';
import { ModuleKind, ScriptTarget, transpileModule } from 'typescript';
import { createServer } from 'vite';
import { ElIcon, ElMessage, ID_INJECTION_KEY } from 'element-plus';

const server = await createServer({
  configFile: false,
  resolve: { alias: { '@': new URL('../src', import.meta.url).pathname } },
  // Compile client render functions so the test can exercise real click handlers.
  plugins: [
    {
      name: 'test-vue-render',
      transform(source, id) {
        // Video dialogs require a browser DOM and are unrelated to file actions.
        if (id.endsWith('/src/runtime/modal.ts')) {
          return 'export const useVbenModal = () => [() => null, {}];';
        }
        if (!id.endsWith('.vue')) return;
        const { descriptor } = parse(source, { filename: id });
        const script = compileScript(descriptor, { id, inlineTemplate: true });
        return {
          code: transpileModule(script.content, {
            compilerOptions: {
              module: ModuleKind.ESNext,
              target: ScriptTarget.ES2022,
            },
          }).outputText,
        };
      },
    },
  ],
  server: { middlewareMode: true, hmr: false },
});
after(() => server.close());
const { setupDisguise } = await server.ssrLoadModule('/src/setup.ts');
const { default: FileUpload } = await server.ssrLoadModule(
  '/src/components/file-upload/file-upload.vue',
);
const { default: FileStatus } = await server.ssrLoadModule(
  '/src/components/file-upload/components/file-status.vue',
);

const node = (type) => ({ type, props: {}, children: [], parent: null });
const teleportTarget = node('teleport');
const renderer = createRenderer({
  querySelector: () => teleportTarget,
  patchProp: (el, key, _previous, value) => (el.props[key] = value),
  insert(el, parent, anchor) {
    if (el.parent) {
      el.parent.children.splice(el.parent.children.indexOf(el), 1);
    }
    el.parent = parent;
    const index = anchor ? parent.children.indexOf(anchor) : -1;
    parent.children.splice(index < 0 ? parent.children.length : index, 0, el);
  },
  remove(el) {
    if (el.parent) {
      el.parent.children.splice(el.parent.children.indexOf(el), 1);
      el.parent = null;
    }
  },
  createElement: node,
  createText: () => node('#text'),
  createComment: () => node('#comment'),
  setText: (el, text) => (el.text = text),
  setElementText: (el, text) => (el.text = text),
  parentNode: (el) => el.parent,
  nextSibling: (el) =>
    el.parent?.children[el.parent.children.indexOf(el) + 1] || null,
});
const apps = [];
afterEach(() => {
  for (const app of apps.splice(0)) app.unmount();
  mock.restoreAll();
  setupDisguise({ uploadFile: null });
});

function mount(render) {
  const root = node('root');
  const app = renderer.createApp({ render });
  app.provide(ID_INJECTION_KEY, { prefix: 0, current: 0 });
  app.component('ElIcon', ElIcon);
  app.mount(root);
  apps.push(app);
  return { app, root };
}

function findAll(root, predicate) {
  return [
    ...(predicate(root) ? [root] : []),
    ...root.children.flatMap((child) => findAll(child, predicate)),
  ];
}

const actionIcons = (root) =>
  findAll(root, (el) => el.props.class?.includes('file-action-icon'));

test('failed files show only remove, and action callbacks receive the file', async () => {
  const file = { name: '附件.xlsx', url: '/attachment.xlsx' };
  const status = ref('error');
  const disabled = ref(false);
  const showRemove = ref(true);
  const actions = [];
  const { root } = mount(() =>
    h(FileStatus, {
      status: status.value,
      file,
      disabled: disabled.value,
      showRemove: showRemove.value,
      onPreview: (value) => actions.push(['preview', value]),
      onDownload: (value) => actions.push(['download', value]),
      onRemove: (value) => actions.push(['remove', value]),
    }),
  );
  assert.equal(actionIcons(root).length, 1);
  let stopped = false;
  actionIcons(root)[0].props.onClick({
    stopPropagation: () => (stopped = true),
  });
  assert.equal(stopped, true);
  assert.deepEqual(actions, [['remove', file]]);

  showRemove.value = false;
  await nextTick();
  assert.equal(actionIcons(root).length, 0);
  showRemove.value = true;
  disabled.value = true;
  await nextTick();
  assert.equal(actionIcons(root).length, 0);

  disabled.value = false;
  status.value = 'success';
  await nextTick();
  assert.equal(actionIcons(root).length, 3);
  for (const icon of actionIcons(root)) {
    icon.props.onClick({ stopPropagation() {} });
  }
  assert.deepEqual(actions.slice(1), [
    ['preview', file],
    ['download', file],
    ['remove', file],
  ]);
});

test('clicking remove deletes only the failed upload and allows another upload', async () => {
  mock.method(ElMessage, 'error', () => {});
  setupDisguise({
    uploadFile: async () => {
      throw new Error('Request failed with status code 422');
    },
  });
  const existing = { name: '附件.xlsx', url: '/existing.xlsx' };
  const modelValue = ref([existing]);
  const removals = [];
  const updates = [];
  const { app, root } = mount(() =>
    h(FileUpload, {
      modelValue: modelValue.value,
      maxCount: 2,
      'onUpdate:modelValue': (value) => {
        updates.push(value);
        modelValue.value = value;
      },
      onRemove: (file) => removals.push(file),
    }),
  );
  const uploader = () =>
    app._instance.subTree.component.subTree.children.find(
      (vnode) => vnode.type?.name === 'ElUpload',
    );
  const file = new File(['content'], '附件.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  await uploader().component.props.httpRequest({ file });
  await nextTick();
  assert.equal(actionIcons(root).length, 4);
  // A failed entry must not consume the remaining upload slot.
  assert.equal(uploader().component.props.beforeUpload(file), true);
  actionIcons(root)[0].props.onClick({ stopPropagation() {} });
  await nextTick();
  assert.equal(actionIcons(root).length, 3);
  assert.equal(findAll(root, (el) => el.props.class === 'file-item').length, 1);
  assert.deepEqual(modelValue.value, [existing]);
  assert.deepEqual(updates, []);
  assert.deepEqual(removals, [
    { name: file.name, type: file.type, size: file.size },
  ]);
});
