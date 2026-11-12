import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
import { computed } from 'vue';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  ssr: { noExternal: ['async-validator'] },
});
after(() => server.close());
const { resolveTranslateRules, translateLanguages } =
  await server.ssrLoadModule(
    '/src/components/schema-form/translate-validation.ts',
  );
const { setupDisguise } = await server.ssrLoadModule('/src/setup.ts');
afterEach(() => setupDisguise({ translateLanguages: [] }));
const language = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'zh_cn', label: '简体中文' },
];
const field = {
  prop: 'title',
  label: '标题',
  type: 'text',
  required: true,
  translateConfig: { language },
};
function setup(overrides = {}, values = {}) {
  let errors = {};
  const rules = resolveTranslateRules(
    { ...field, ...overrides },
    { mode: 'create', values },
    (next) => {
      errors = next;
    },
  );
  return {
    rules,
    errors: () => errors,
    validate: (value) => rules[0].asyncValidator({}, value),
  };
}

test('required checks configured languages in order, ignoring unconfigured values', async () => {
  const form = setup();
  await assert.rejects(form.validate({ en: 'filled', fr: 'extra' }));
  assert.deepEqual(Object.keys(form.errors()), ['de', 'zh_cn']);
  await form.validate({ de: 'Titel', en: 'Title', zh_cn: '标题' });
  assert.deepEqual(form.errors(), {});
});

test('missing objects, empty strings and whitespace fail all required languages', async () => {
  const form = setup();
  for (const value of [undefined, null, {}, { de: ' ', en: '', zh_cn: '\n' }]) {
    await assert.rejects(form.validate(value));
    assert.deepEqual(Object.keys(form.errors()), ['de', 'en', 'zh_cn']);
  }
});

test('legacy strings populate the first configured language', async () => {
  const form = setup();
  await assert.rejects(form.validate('Titel'));
  assert.deepEqual(Object.keys(form.errors()), ['en', 'zh_cn']);
});

test('rich text rejects empty HTML while accepting text and media', async () => {
  const form = setup({ type: 'rich-text' });
  await assert.rejects(
    form.validate({
      de: '<p><br></p>',
      en: '<p>&nbsp;</p>',
      zh_cn: '<p> </p>',
    }),
  );
  assert.equal(Object.keys(form.errors()).length, 3);
  await form.validate({
    de: '<p>Titel</p>',
    en: '<p><img src="test.png"></p>',
    zh_cn: '<p>标题</p>',
  });
});

test('built-in rules and callback validators receive individual language values and full model', async () => {
  const model = { other: 'expected' };
  const seen = [];
  const form = setup(
    {
      required: false,
      rules: [
        { min: 3, message: 'too short' },
        {
          validator(rule, value, callback, source) {
            assert.equal(rule.field, 'title');
            assert.equal(source, model);
            seen.push(value);
            callback(value === 'bad' ? new Error('invalid title') : undefined);
          },
        },
      ],
    },
    model,
  );
  await assert.rejects(form.validate({ de: 'ok', en: 'bad', zh_cn: 'valid' }));
  assert.deepEqual(form.errors(), { de: 'too short', en: 'invalid title' });
  assert.deepEqual(seen.sort(), ['bad', 'valid']);
});

test('required and custom failures are both reported in the same pass', async () => {
  const form = setup({
    rules: [{ pattern: /^[a-z]+$/, message: 'letters only' }],
  });
  await assert.rejects(form.validate({ de: '', en: '123', zh_cn: 'valid' }));
  assert.deepEqual(Object.keys(form.errors()), ['de', 'en']);
  assert.equal(form.errors().en, 'letters only');
});

test('async completion order does not change language order; errors clear on success', async () => {
  const form = setup({
    required: false,
    rules: [
      {
        asyncValidator: async (_rule, value) => {
          await new Promise((resolve) =>
            setTimeout(resolve, value === 'slow' ? 20 : 0),
          );
          if (value !== 'valid') throw new Error(value);
        },
      },
    ],
  });
  await assert.rejects(
    form.validate({ de: 'slow', en: 'fast', zh_cn: 'valid' }),
    /slow/,
  );
  assert.deepEqual(Object.keys(form.errors()), ['de', 'en']);
  await form.validate({ de: 'valid', en: 'valid', zh_cn: 'valid' });
  assert.deepEqual(form.errors(), {});
});

test('an older asynchronous result cannot overwrite newer language errors', async () => {
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  const form = setup({
    rules: [
      {
        asyncValidator: async (_rule, value) => {
          if (value === 'pending') {
            await pending;
            throw new Error('stale');
          }
        },
      },
    ],
  });
  const older = form.validate({ de: 'pending', en: 'valid', zh_cn: 'valid' });
  const rejection = assert.rejects(older);
  await form.validate({ de: 'valid', en: 'valid', zh_cn: 'valid' });
  release();
  await rejection;
  assert.deepEqual(form.errors(), {});
});

test('conditional required and default language lists remain supported', () => {
  assert.deepEqual(
    setup({ required: ({ values }) => values.required }, { required: false })
      .rules,
    [],
  );
  assert.equal(
    setup({ required: ({ values }) => values.required }, { required: true })
      .rules[0].required,
    true,
  );
  assert.equal(
    translateLanguages({ ...field, translateConfig: {} }).length,
    12,
  );
  assert.equal(
    translateLanguages({ ...field, translateConfig: { language: [] } }).length,
    12,
  );
});

test('global language injection supplies the default list and validation order', async () => {
  const globalLanguages = [
    { code: 'ja', label: '日本語' },
    { code: 'fr', label: 'Français' },
  ];
  setupDisguise({ translateLanguages: globalLanguages });
  assert.deepEqual(
    translateLanguages({ ...field, translateConfig: {} }),
    globalLanguages,
  );
  const form = setup({ translateConfig: {} });
  await assert.rejects(form.validate({ en: 'not configured' }));
  assert.deepEqual(Object.keys(form.errors()), ['ja', 'fr']);
  await form.validate({ ja: 'タイトル', fr: 'Titre' });
  assert.deepEqual(form.errors(), {});
});

test('field language lists replace the global languages instead of merging', async () => {
  setupDisguise({ translateLanguages: [{ code: 'ja', label: '日本語' }] });
  assert.deepEqual(translateLanguages(field), language);
  const form = setup();
  await form.validate({ de: 'Titel', en: 'Title', zh_cn: '标题' });
  assert.deepEqual(form.errors(), {});
});

test('empty field lists inherit global languages; an omitted global option preserves injection', () => {
  setupDisguise({ translateLanguages: language });
  setupDisguise({});
  assert.deepEqual(
    translateLanguages({ ...field, translateConfig: { language: [] } }),
    language,
  );
});

test('reinjecting languages updates reactive consumers and existing validation rules', async () => {
  setupDisguise({ translateLanguages: [{ code: 'ja', label: '日本語' }] });
  const inherited = { ...field, translateConfig: {} };
  const resolved = computed(() => translateLanguages(inherited));
  assert.deepEqual(
    resolved.value.map(({ code }) => code),
    ['ja'],
  );
  const form = setup({ translateConfig: {} });
  setupDisguise({ translateLanguages: [{ code: 'fr', label: 'Français' }] });
  assert.deepEqual(
    resolved.value.map(({ code }) => code),
    ['fr'],
  );
  await assert.rejects(form.validate({ ja: 'タイトル' }));
  assert.deepEqual(Object.keys(form.errors()), ['fr']);
  await form.validate({ fr: 'Titre' });
});
