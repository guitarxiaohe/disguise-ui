import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { resolve } from 'node:path';
import ts from 'typescript';
import { computed, reactive, ref } from 'vue';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
});
after(() => server.close());
const { resolveFormField, resolveSearchField } = await server.ssrLoadModule(
  '/src/components/crud-page/field-schema.ts',
);
const field = { prop: 'category_id', label: '分类', type: 'cascader' };

test('search.props reaches the control for object and function configurations', () => {
  const options = [{ id: 1, name: '分类' }];
  const props = {
    options,
    clearable: true,
    props: { label: 'name', value: 'id' },
  };
  assert.deepEqual(
    resolveSearchField({ ...field, search: { props } }).props,
    props,
  );
  const resolver = () => props;
  assert.equal(
    resolveSearchField({ ...field, search: { props: resolver } }).props,
    resolver,
  );
});

test('both form and search defer callbacks and preserve context, updates and reactivity', () => {
  for (const resolveField of [resolveFormField, resolveSearchField]) {
    const options = ref([]);
    const values = reactive({ category_id: null, clearable: true });
    const ctx = {
      mode: 'edit',
      values,
      updateValue: (value) => {
        values.category_id = value;
      },
    };
    const seen = [];
    const baseProps = (context) => {
      assert.equal(context, ctx);
      seen.push('base');
      return { options: options.value, clearable: false };
    };
    const localProps = (context) => {
      assert.equal(context, ctx);
      seen.push('local');
      return {
        clearable: context.values.clearable,
        onChange: () => context.updateValue(context.mode),
      };
    };
    const schema = resolveField({
      ...field,
      props: baseProps,
      form: { props: localProps },
      search: { props: localProps },
    });
    assert.deepEqual(seen, []);
    const resolved = computed(() => schema.props(ctx));
    assert.equal(resolved.value.clearable, true);
    assert.deepEqual(seen, ['base', 'local']);
    options.value = [{ id: 1, name: '分类' }];
    values.clearable = false;
    assert.equal(resolved.value.options, options.value);
    assert.equal(resolved.value.clearable, false);
    resolved.value.onChange();
    assert.equal(values.category_id, 'edit');
  }
});

test('local props override common props without leaking between form and search', () => {
  const configured = {
    ...field,
    props: { clearable: false, filterable: true },
    form: { label: '表单分类', props: { clearable: true } },
    search: {
      label: '搜索分类',
      clearable: true,
      fitInputWidth: true,
      props: { clearable: false },
    },
  };
  const form = resolveFormField(configured);
  const search = resolveSearchField(configured);
  assert.equal(form.label, '表单分类');
  assert.deepEqual(form.props, { clearable: true, filterable: true });
  assert.equal(search.label, '搜索分类');
  assert.deepEqual(search.props, {
    clearable: false,
    filterable: true,
    fitInputWidth: true,
  });
  assert.deepEqual(configured.props, { clearable: false, filterable: true });
});

test('boolean switches, default values and search validation defaults stay compatible', () => {
  assert.equal(resolveFormField({ ...field, form: false }), null);
  assert.equal(resolveSearchField({ ...field, search: false }), null);
  assert.equal(resolveSearchField(field), null);
  const configured = {
    ...field,
    hidden: true,
    readonly: true,
    required: true,
    rules: [{ required: true }],
    props: { clearable: true },
    form: { defaultValue: [1] },
    search: { defaultValue: '' },
  };
  assert.deepEqual(resolveFormField(configured).defaultValue, [1]);
  const search = resolveSearchField(configured);
  assert.equal(search.defaultValue, '');
  assert.equal(search.hidden, false);
  assert.equal(search.readonly, false);
  assert.equal(search.required, false);
  assert.deepEqual(search.rules, []);
  assert.deepEqual(
    resolveSearchField({ ...field, search: true }).props,
    undefined,
  );
});

test('group overrides keep children and field metadata in the correct place', () => {
  const children = [{ prop: 'name', label: '名称', type: 'text' }];
  const group = {
    type: 'group',
    label: '分组',
    children: [],
    hidden: true,
    form: { label: '表单分组', children },
    search: { label: '搜索分组', children, description: '说明', anchor: true },
  };
  assert.equal(resolveFormField(group).children, children);
  const search = resolveSearchField(group);
  assert.equal(search.children, children);
  assert.equal(search.hidden, false);
  assert.equal(search.description, '说明');
  assert.equal(search.anchor, true);
  assert.equal('form' in search, false);
});

test('CrudPageField contextually types all props callbacks, including cascader props', () => {
  const filename = resolve('tests/crud-page-fields.typecheck.ts');
  const source = `
    import type { CrudPageField } from '../src/components/crud-page/index.type';
    import type { FieldPropsContext } from '../src/components/schema-form/schema-form.type';
    type IsAny<T> = 0 extends (1 & T) ? true : false;
    const fields: CrudPageField[] = [{
      prop: 'category_id', label: '分类', type: 'cascader',
      props: (ctx) => {
        const typed: IsAny<typeof ctx> = false;
        const context: FieldPropsContext = ctx;
        return { options: [] };
      },
      form: { props: ({ mode, values, updateValue }) => {
        const typed: IsAny<typeof updateValue> = false;
        const currentMode: 'create' | 'edit' | 'view' = mode;
        return { options: [], onChange: () => updateValue(values.category_id) };
      } },
      search: { props: ({ mode, values, updateValue }) => {
        const typed: IsAny<typeof values> = false;
        const currentMode: 'create' | 'edit' | 'view' = mode;
        return { options: [], onChange: () => updateValue(values.category_id) };
      } },
    }];
    // @ts-expect-error Cascader options must be an array, including inside form.props.
    const invalid: CrudPageField = {
      prop: 'category_id', label: '分类', type: 'cascader',
      form: { props: { options: () => [] } },
    };
  `;
  const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    process.cwd(),
  );
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (path, ...args) =>
    path === filename
      ? ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true)
      : getSourceFile(path, ...args);
  const program = ts.createProgram(
    [filename, resolve('src/env.d.ts')],
    options,
    host,
  );
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.equal(
    diagnostics.length,
    0,
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: (path) => path,
      getNewLine: () => '\n',
    }),
  );
});
