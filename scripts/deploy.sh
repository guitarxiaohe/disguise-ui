#!/usr/bin/env bash
# Disguise 文档站一键 Docker 部署：本地打包、上传服务器、远程重建容器
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEPLOY_DIR="${REPO_DIR}/.deploy/disguise-ui"
ARCHIVE_PATH="${REPO_DIR}/.deploy/disguise-ui-deploy.tar.gz"

DEPLOY_HOST="${DEPLOY_HOST:-110.42.237.20}"
DEPLOY_USER="${DEPLOY_USER:-ubuntu}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
APP_PORT="${APP_PORT:-3006}"
REMOTE_DIR="${REMOTE_DIR:-/home/ubuntu/project/disguise-ui}"
REMOTE_ARCHIVE="/tmp/disguise-ui-deploy.tar.gz"

SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"
SSH_OPTS=(-p "${DEPLOY_PORT}")
SCP_OPTS=(-P "${DEPLOY_PORT}")
GIT_HASH="$(git -C "${REPO_DIR}" rev-parse --short HEAD 2>/dev/null || printf unknown)"
GIT_SUBJECT="$(git -C "${REPO_DIR}" log -1 --pretty=%s 2>/dev/null || printf '版本更新')"
DEPLOY_TIME="$(date '+%Y-%m-%d %H:%M:%S %z')"

if [[ ! "${DEPLOY_PORT}" =~ ^[0-9]+$ ]] || (( DEPLOY_PORT < 1 || DEPLOY_PORT > 65535 )); then
  echo "DEPLOY_PORT 必须是 1-65535 之间的数字" >&2
  exit 1
fi

if [[ ! "${APP_PORT}" =~ ^[0-9]+$ ]] || (( APP_PORT < 1 || APP_PORT > 65535 )); then
  echo "APP_PORT 必须是 1-65535 之间的数字" >&2
  exit 1
fi

for command_name in npm ssh scp tar; do
  command -v "${command_name}" >/dev/null || {
    echo "未找到 ${command_name} 命令" >&2
    exit 1
  }
done

echo "==> 构建文档站（提交 ${GIT_HASH}）..."
cd "${REPO_DIR}"
npm run docs:build

echo "==> 准备 Docker 部署包..."
rm -rf "${DEPLOY_DIR}"
mkdir -p "${DEPLOY_DIR}" "$(dirname "${ARCHIVE_PATH}")"
cp -R "${REPO_DIR}/docs/.vitepress/dist" "${DEPLOY_DIR}/dist"
cp "${REPO_DIR}/deploy/disguise-ui/Dockerfile" "${DEPLOY_DIR}/Dockerfile"
cp "${REPO_DIR}/deploy/disguise-ui/docker-compose.yml" "${DEPLOY_DIR}/docker-compose.yml"
cp "${REPO_DIR}/deploy/disguise-ui/nginx.conf" "${DEPLOY_DIR}/nginx.conf"
printf '%s | %s | %s\n' "${DEPLOY_TIME}" "${GIT_HASH}" "${GIT_SUBJECT}" > "${DEPLOY_DIR}/deploy-info.txt"
tar -C "${DEPLOY_DIR}" -czf "${ARCHIVE_PATH}" .

echo "==> 上传到服务器：${SSH_TARGET}:${REMOTE_DIR}"
ssh "${SSH_OPTS[@]}" "${SSH_TARGET}" "mkdir -p '${REMOTE_DIR}'"
scp "${SCP_OPTS[@]}" "${ARCHIVE_PATH}" "${SSH_TARGET}:${REMOTE_ARCHIVE}"

echo "==> 远程解压并部署 Docker 容器..."
ssh "${SSH_OPTS[@]}" "${SSH_TARGET}" \
  "REMOTE_DIR='${REMOTE_DIR}' REMOTE_ARCHIVE='${REMOTE_ARCHIVE}' APP_PORT='${APP_PORT}' sh -s" <<'REMOTE_SCRIPT'
set -eu
mkdir -p "${REMOTE_DIR}"
tar -xzf "${REMOTE_ARCHIVE}" -C "${REMOTE_DIR}"
cd "${REMOTE_DIR}"
APP_PORT="${APP_PORT}" docker compose up -d --build --remove-orphans
docker compose ps
cat deploy-info.txt >> deploy-history.log
REMOTE_SCRIPT

echo "==> 部署完成：http://${DEPLOY_HOST}:${APP_PORT}"
echo "==> 当前提交：${GIT_HASH} ${GIT_SUBJECT}"
