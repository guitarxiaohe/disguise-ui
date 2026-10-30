# 快速开始

组件不直接请求你们的后台。先在应用启动时注入运行时，再按需使用组件。

## 1. 注入运行时

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
});

const app = createApp(App);
app.use(ElementPlus);
app.use(VueQueryPlugin);
app.mount('#app');
```

`fetchAllDictData` 返回 `{ 字典编码: 字典项[] }`。字典项至少包含 `code` 或 `dictValue`，以及 `name` 或 `dictLabel`。

## 2. 注册远程实体

远程下拉（`AsyncSelect` / `async-select` 字段）通过 `registerEntity` 找到取数函数：

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

## 3. 写一个增删改查页

```vue
<script setup lang="ts">
import { CrudPage } from 'disguise-ui';
import type { CrudPageField } from 'disguise-ui';

const fields: CrudPageField[] = [
  { prop: 'name', label: '名称', type: 'text', required: true, search: true },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    optionSource: 'dict',
    dictCode: 'sys_status',
    search: true,
  },
];
</script>

<template>
  <CrudPage
    :fields="fields"
    :data="fetchList"
    :on-create="createItem"
    :on-update="updateItem"
    :on-delete="deleteItem"
  />
</template>
```

完整可交互示例见 [CrudPage](/components/crud-page)。

## 权限指令

`CrudPage` 和 `TableEntity` 会使用宿主应用的 `v-access` 指令控制按钮显隐。未注册该指令时，按钮仍会渲染；注入 `hasAccess` 后，组件内部的权限判断会按返回值过滤操作。
