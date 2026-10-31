import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist/types');

rmSync(output, { force: true, recursive: true });
mkdirSync(output, { recursive: true });
execFileSync(
  process.platform === 'win32' ? 'vue-tsc.cmd' : 'vue-tsc',
  [
    '--declaration',
    '--emitDeclarationOnly',
    '--noEmit',
    'false',
    '--noCheck',
    '--outDir',
    'dist/types',
  ],
  { cwd: root, stdio: 'inherit' },
);

// The declaration entry imports the package's runtime CSS. Keep the package
// consumable by TypeScript without shipping a declaration for that side effect.
const entry = resolve(output, 'index.d.ts');
if (existsSync(entry)) {
  const source = readFileSync(entry, 'utf8');
  writeFileSync(entry, source.replace("import './theme.css';\n", ''));
}

function rewriteAliasImports(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const file = resolve(directory, item.name);
    if (item.isDirectory()) {
      rewriteAliasImports(file);
      continue;
    }
    if (!item.name.endsWith('.d.ts')) continue;

    const source = readFileSync(file, 'utf8');
    const rewritten = source.replace(
      /(['"])(@\/[^'"]+)\1/g,
      (match, quote, specifier) => {
        const target = resolve(output, specifier.slice(2));
        const relativePath = relative(dirname(file), target);
        const normalizedPath = relativePath.startsWith('.')
          ? relativePath
          : `./${relativePath}`;
        return `${quote}${normalizedPath}${quote}`;
      },
    );
    if (rewritten !== source) writeFileSync(file, rewritten);
  }
}

rewriteAliasImports(output);

