import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

test('the published CSS includes avatar, teleported drawer and tooltip styles without the docs Tailwind pipeline', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const result = await build({
    root,
    configFile: `${root}vite.config.ts`,
    logLevel: 'silent',
    build: { write: false },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap(
    (bundle) => bundle.output,
  );
  const css = outputs.find((output) => output.fileName === 'style.css');
  assert.ok(css?.type === 'asset', 'the package must ship a stylesheet');
  const source = String(css.source);
  const component = await readFile(
    new URL('../src/components/user-avatar-info/index.vue', import.meta.url),
    'utf8',
  );
  const template = component.split('<template>')[1].split('<style')[0];
  const classes = [...template.matchAll(/\sclass="([^"]+)"/g)].flatMap(
    (match) => match[1].split(/\s+/),
  );
  assert.ok(classes.length > 30, 'check the complete component template');
  for (const name of new Set(classes)) {
    assert.ok(
      name.startsWith('user-avatar-info'),
      `avatar layout must not rely on host utility class ${name}`,
    );
    assert.ok(source.includes(`.${name}`), `missing published style: ${name}`);
  }
  for (const selector of [
    '.user-avatar-info__meta--male',
    '.user-avatar-info__meta--female',
    '.user-avatar-info-tooltip',
    '.user-avatar-info-drawer.theme-female',
  ]) {
    assert.ok(
      source.includes(selector),
      `missing published style: ${selector}`,
    );
  }
  assert.ok(source.includes('linear-gradient('), 'ship the hero background');
  assert.ok(!source.includes('@tailwind'), 'publish compiled CSS');
});
