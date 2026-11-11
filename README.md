# Disguise UI

[文档地址](https://www.disguise-ui.com) · [GitHub](https://github.com/guitarxiaohe/disguise-ui)

![npm version](https://img.shields.io/npm/v/disguise-ui) ![license](https://img.shields.io/npm/l/disguise-ui) ![vue](https://img.shields.io/badge/vue-3.5%2B-brightgreen) ![element-plus](https://img.shields.io/badge/element--plus-2.14%2B-brightgreen)

可独立使用的 Vue 3 后台组件库：列表、表单、上传、导入导出。安装后不依赖任何后台的接口、字典和权限——这些能力在应用启动时注入，组件只负责渲染和交互。

## 特性

- **运行时注入**：请求、上传、字典、权限、文案全部通过 `setupDisguise` 在启动时注入，不绑定任何后端接口
- **元数据驱动**：一份字段 schema 同时生成搜索表单、表格和表单抽屉（`CrudPage`），也支持分拆单独使用
- **字典体系**：`fetchAllDictData` 注入 + vue-query 缓存，`DictTag` 把原始值渲染成彩色标签
- **权限控制**：`hasAccess` 按钮级权限码校验，`getAccessToken` 导出鉴权
- **导入导出**：`ImportDialog` 支持 Excel/CSV 导入、字段映射、模板下载；`CrudPage` 配置 `importUrl`/`exportUrl` 一键启用
- **虚拟化表格**：`TableEntity` 基于 ElTableV2，支持树形、拖拽排序、批量操作和内置单元格类型
- **国际化**：内置 zh-CN / en-US，支持 `locale` 切换与 `messages` 覆盖
- **TypeScript**：全部组件导出完整类型定义

## 组件

| 分类     | 组件                                                                                                                                                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 页面     | `CrudPage` 增删改查整页                                                                                                                                                                                                                |
| 数据录入 | `SchemaForm` 元数据表单、`SearchForm` 搜索表单、`DrawerFormPage` 抽屉表单、`AsyncSelect` 远程下拉、`DialogList` 弹窗列表、`PictureUpload` 图片上传（支持裁剪）、`ImageUpload` 轻量单图、`FileUpload` 文件上传、`RichTextEditor` 富文本 |
| 数据展示 | `TableEntity` 虚拟化表格、`ImagesView` 多图预览、`DictTag` 字典标签、`BaseCard` 卡片、`UserAvatarInfo` 用户头像                                                                                                                        |
| 反馈     | `ImportDialog` 导入弹窗                                                                                                                                                                                                                |
| 其他     | `DisguiseIcon` 图标                                                                                                                                                                                                                    |

## 安装

```bash
npm install disguise-ui vue element-plus @element-plus/icons-vue @vueuse/core @tanstack/vue-query dayjs vue-draggable-plus lucide-vue-next
```

富文本还需要 `@tiptap/vue-3`、`@tiptap/starter-kit` 以及编辑器里用到的 `@tiptap/extension-*`。

兼容版本：Vue `^3.5.0`、Element Plus `^2.14.0`。

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

### 远程下拉

用 `registerEntity` 注册业务实体，schema 里的 `async-select` 字段按 `entityKey` 即插即用：

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

### 样式与图标

页面里的工具类来自 Tailwind，使用方需要把构建产物加进扫描范围：

```js
content: ['./node_modules/disguise-ui/dist/**/*.js'];
```

`DisguiseIcon` 只负责拼接图标类名，图标字体样式需要使用方自己引入。

## 文档

完整文档（安装、快速开始、运行时注入、全部组件 API）见 [www.disguise-ui.com](https://www.disguise-ui.com)。

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

## License

[GPL-3.0](./LICENSE)
