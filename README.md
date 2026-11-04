# Disguise

从原后台抽出的列表、表单、上传组件。安装后不依赖原后台的接口、字典和权限，这些能力在启动时注入。

## 包含

`CrudPage`、`TableEntity`、`SchemaForm`、`SearchForm`、`DrawerFormPage`、`AsyncSelect`、`DictTag`、`ImportDialog`、`ImageUpload`、`ImagesView`、`PictureUpload`、`RichTextEditor`、`BaseCard`、`DisguiseIcon`。

业务实体（商品、部门、用户）没有打进包。远程下拉用 `registerEntity` 自己注册。

## 安装

```bash
npm install disguise-ui vue element-plus @element-plus/icons-vue @vueuse/core @tanstack/vue-query dayjs vue-draggable-plus lucide-vue-next
```

富文本还需要 `@tiptap/vue-3`、`@tiptap/starter-kit` 以及编辑器里用到的 `@tiptap/extension-*`。

## 使用

```ts
import { createApp } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import ElementPlus from 'element-plus';
import { setupDisguise } from 'disguise-ui';

import 'element-plus/dist/index.css';
import 'disguise-ui/style.css';

setupDisguise({
  locale: 'zh-CN',
  imageBaseUrl: 'https://cdn.example.com',
  getAccessToken: () => localStorage.getItem('token') ?? '',
  hasAccess: (codes) => codes.every((code) => permissions.includes(code)),
  fetchAllDictData: async () => {
    const response = await fetch('/api/dict/values');
    return response.json();
  },
  uploadFile: async (file) => {
    const body = new FormData();
    body.append('file', file);
    const response = await fetch('/api/file_manager/upload', {
      method: 'POST',
      body,
    });
    return response.json();
  },
  request: {
    getBaseUrl: () => '/api',
    download: async (url, config) => {
      const response = await fetch(url, {
        method: String(config?.method ?? 'POST'),
        body: config?.data ? JSON.stringify(config.data) : undefined,
      });
      return { data: await response.blob(), headers: response.headers };
    },
    upload: async (url, data) => {
      const body = new FormData();
      Object.entries(data ?? {}).forEach(([key, value]) => {
        body.append(key, value as Blob | string);
      });
      const response = await fetch(url, { method: 'POST', body });
      return response.json();
    },
  },
});

const app = createApp(App);
app.use(ElementPlus);
app.use(VueQueryPlugin);
```

`fetchAllDictData` 返回 `{ 字典编码: 字典项[] }`。字典项至少包含 `code` 或 `dictValue`，以及 `name` 或 `dictLabel`。

远程下拉：

```ts
import { registerEntity } from 'disguise-ui';

registerEntity({
  key: 'dept',
  labelKey: 'name',
  valueKey: 'id',
  fetch: async ({ keyword, page, per_page }) => {
    return { items: [], total: 0 };
  },
});
```

页面里的工具类来自 Tailwind。使用方需要把构建产物加进扫描范围：

```js
content: ['./node_modules/disguise-ui/dist/**/*.js']
```

`DisguiseIcon` 只负责拼接图标类名，图标字体样式需要使用方自己引入。

## 文档站

本地会启动一个类似 Element Plus 的组件说明站，包含实时示例、源码和 API：

```bash
npm run docs:dev      # 开发
npm run docs:preview  # 先构建再预览正式包
```

## 构建

```bash
npm install
npm run build
```

产物在 `dist/disguise-ui.js` 和 `dist/style.css`。

## 自动部署文档站

部署方式与 meeting-vue 一致：本地构建静态产物，打成部署包上传服务器，再通过 Docker Compose 重建容器。首次部署前，请确认本机可以通过 SSH 登录服务器（默认 `ubuntu@110.42.237.20`），服务器已安装 Docker 和 Docker Compose。然后在项目根目录执行：

```bash
npm run deploy
```

脚本会自动生成版本信息、在本地构建文档站、上传部署包并重建容器。部署地址为 `http://110.42.237.20:3006`。

每次构建会把当前分支、提交哈希和最近 5 条提交写入 `version.json`。页面保持打开时会每分钟检查一次新版本，发现更新后展示提交记录；服务器的 `deploy-history.log` 也会追加每次成功部署的提交信息。

可通过环境变量覆盖默认配置，例如：

```bash
DEPLOY_USER=ubuntu DEPLOY_PORT=22 APP_PORT=3006 npm run deploy
```

服务器需要在安全组或防火墙中放行 TCP 端口 `3006`。
