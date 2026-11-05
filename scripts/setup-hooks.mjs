import { execSync } from 'node:child_process';

// 仅在 git 仓库中启用 .githooks 目录作为 hooks 路径
try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  execSync('git config core.hooksPath .githooks', { stdio: 'inherit' });
  console.log('Git hooks 已启用(core.hooksPath = .githooks)');
} catch {
  console.log('非 git 环境,跳过 Git hooks 配置');
}
