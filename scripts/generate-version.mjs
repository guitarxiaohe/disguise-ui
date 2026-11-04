import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoDir = resolve(scriptDir, '..');
const targetPath = resolve(repoDir, 'docs/public/version.json');

function git(args, fallback = 'unknown') {
  try {
    return execFileSync('git', args, {
      cwd: repoDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return fallback;
  }
}

function formatReleaseNote(subject) {
  const types = [
    [/^feat(?:\([^)]+\))?:\s*/, '✨ 新增：'],
    [/^fix(?:\([^)]+\))?:\s*/, '🐛 修复：'],
    [/^perf(?:\([^)]+\))?:\s*/, '⚡ 优化：'],
    [/^docs(?:\([^)]+\))?:\s*/, '📝 文档：'],
    [/^style(?:\([^)]+\))?:\s*/, '💄 样式：'],
    [/^refactor(?:\([^)]+\))?:\s*/, '♻️ 重构：'],
    [/^chore(?:\([^)]+\))?:\s*/, '🔧 杂务：'],
  ];
  for (const [pattern, label] of types) {
    if (pattern.test(subject)) return label + subject.replace(pattern, '');
  }
  return '📌 ' + subject;
}

const hash = git(['rev-parse', '--short', 'HEAD']);
const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
const rawLogs = git(
  ['log', '-5', '--date=iso-strict', '--pretty=format:%h%x1f%ad%x1f%an%x1f%s%x1e'],
  '',
);
const commits = rawLogs
  .split('\x1e')
  .map((row) => row.trim())
  .filter(Boolean)
  .map((row) => {
    const [commitHash, date, author, subject] = row.split('\x1f');
    return { hash: commitHash, date, author, subject };
  });
const buildTime = new Date().toISOString();
const versionInfo = {
  version: buildTime.replace(/[-:T]/g, '').slice(0, 14) + '-' + hash,
  hash,
  branch,
  buildTime,
  releaseNotes: commits.map(({ subject }) => formatReleaseNote(subject)),
  commits,
};

mkdirSync(dirname(targetPath), { recursive: true });
writeFileSync(targetPath, JSON.stringify(versionInfo, null, 2) + '\n', 'utf8');
console.log('✅ 已生成版本信息：' + versionInfo.version);
console.log('📝 最近提交：' + versionInfo.releaseNotes.join(' | '));
