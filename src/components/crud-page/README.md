# CrudPage

`CrudPage` 使用一份字段元数据，同时生成搜索表单、`TableEntity` 和 `DrawerFormPage`。

## 基础用法

```vue
<script setup lang="ts">
import type { CrudPageField, CrudPageProps } from '#/components';
import type { TableEntityDataFetcher } from '#/components/table-entity/index.type';

import { CrudPage } from '#/components';

const fields: CrudPageField[] = [
  {
    prop: 'name',
    label: '名称',
    type: 'text',
    required: true,
    search: true,
    table: { width: 180 },
  },
  {
    prop: 'status',
    label: '状态',
    type: 'switch',
    defaultValue: true,
    table: { width: 100 },
  },
  {
    prop: 'createTime',
    label: '创建时间',
    type: 'datetime',
    form: false,
    table: { width: 180 },
  },
];

const fetchList: TableEntityDataFetcher = async ({
  current_page,
  per_page,
  query,
}) => {
  const res = await getListApi({ page: current_page, per_page, ...query });
  return { rows: res.list, total: res.total };
};

const handleCreate: CrudPageProps['onCreate'] = async (values) => {
  await createApi(values);
};

const handleUpdate: CrudPageProps['onUpdate'] = async (values, row) => {
  await updateApi(row.id, values);
};

const handleDelete: CrudPageProps['onDelete'] = async (row) => {
  await deleteApi(row.id);
};
</script>

<template>
  <CrudPage
    :fields="fields"
    :data="fetchList"
    permission-code="system:demo"
    :on-create="handleCreate"
    :on-update="handleUpdate"
    :on-delete="handleDelete"
  />
</template>
```

`data` 支持两种形态：

- 数组：直接作为表格数据
- 函数：签名同 `TableEntityDataFetcher`，分页、排序和搜索条件由表格传入

搜索提交后，当前搜索值会作为 `query` 传给数据函数；重置会清空 `query`，仅保留表格当前分页参数，并按当前页重新加载。需要回到第一页时，调用暴露的 `reload(1)`。

## 字段

字段类型与 `SchemaForm` 相同。表格列由字段生成：`prop` 映射为 `dataIndex` / `key`，`label` 映射为 `title`。`date`、`datetime` 会自动带上对应的 `valueType`。

长表单可将字段按 `group` 分区，并为需要快速定位的分区设置 `anchor: true`。抽屉表单顶部会显示这些分区标签，点击后滚动到对应分区；未设置锚点的分组不会出现在导航中。

```ts
const fields: CrudPageField[] = [
  {
    type: 'group',
    label: '基本信息',
    anchor: true,
    children: [
      { prop: 'name', label: '名称', type: 'text' },
      { prop: 'code', label: '编码', type: 'text' },
    ],
  },
  {
    type: 'group',
    label: '特殊信息',
    anchor: true,
    children: [{ prop: 'description', label: '描述', type: 'textarea' }],
  },
];
```

`picture` 和 `file` 字段会自动使用对应的表单上传组件，并将表格列分别渲染为图片预览和文件附件单元格；可以在 `table` 对象中继续覆盖列配置。

```ts
const fields: CrudPageField[] = [
  {
    prop: 'type',
    label: '类型',
    type: 'radio',
    options: [
      { label: '普通', value: 'normal' },
      { label: '外链', value: 'link' },
    ],
    table: { width: 100 },
  },
  {
    prop: 'url',
    label: '链接地址',
    type: 'text',
    table: { width: 260 },
    hidden: ({ values }) => values.type !== 'link',
    disabled: ({ values }) => values.type === 'normal',
    required: ({ values }) => values.type === 'link',
  },
  {
    prop: 'target',
    label: '打开方式',
    type: 'select',
    options: ({ values }) =>
      values.type === 'link'
        ? [
            { label: '当前窗口', value: '_self' },
            { label: '新窗口', value: '_blank' },
          ]
        : [],
    hidden: ({ values }) => values.type !== 'link',
  },
];
```

字段联动统一使用 `FieldContext`：

```ts
{
  prop: 'url',
  label: '链接地址',
  type: 'text',
  props: ({ values, updateValue }) => ({
    maxlength: values.type === 'link' ? 500 : 100,
    onBlur: () => updateValue(String(values.url ?? '').trim()),
  }),
}
```

`hidden`、`disabled`、`required`、`options` 和 `props` 的函数都可以读取：

- `mode`：`create`、`edit` 或 `view`
- `values`：当前表单的全部值

`props` 额外提供 `updateValue`，用于在控件事件里回写字段值。

出现位置：

| 配置 | 说明 |
| --- | --- |
| `table` | 默认出现在表格。对象会合并进列配置，例如 `width`、`cellRenderer`、`sortable` |
| `table: false` | 不出现在表格 |
| `form: false` | 不出现在抽屉表单 |
| `search: true` | 复用字段配置生成搜索项 |
| `search: { ... }` | 覆盖搜索字段；不在搜索字段白名单里的键会合并进控件 `props` |
| `type: 'group'` | 只用于表单和搜索，不会生成表格列，且 `table` 只能为 `false` |

搜索项不会继承表单上的 `hidden`、`readonly`、`required` 和 `rules`，需要在 `search` 对象里单独声明。

表格列对象支持 `verticalAlign: 'top' | 'center' | 'bottom'`，用于控制单元格内容的垂直对齐方式。

也可以不走字段推导，直接用 `searchFormProps.schema` 提供完整搜索 schema，此时字段上的 `search` 不再生效。

## 提交与删除

| 处理函数 | 调用时机 | 返回值 |
| --- | --- | --- |
| `onCreate(values)` | 新增提交 | 返回 `false` 时不提示成功、不关闭、不刷新 |
| `onUpdate(values, row)` | 编辑提交。`values` 是原行数据与表单值的合并结果 | 同上 |
| `onDelete(row)` | 行内删除；未配置 `onBatchDelete` 时，批量删除会逐行调用 | 返回 `false` 时中止后续删除 |
| `onBatchDelete(rows)` | 批量删除，优先级高于逐行 `onDelete` | 返回 `false` 时不提示成功、不刷新 |
| `resolveFormValues(mode, row)` | 编辑或查看打开前拉取详情，结果会合并进当前行并回填表单 | — |
| `onExport()` | 点击导出，优先级高于 `exportUrl` | 返回 `false` 时不提示「导出任务已提交」 |

抛出异常时，组件会提示对应的失败文案。

新增时会合并 `defaultValues`，并去掉 `rowKey` 字段。行内「复制」会以该行数据打开新增表单，同样去掉 `rowKey`。

单行删除默认弹出确认框，文案用 `deleteConfirmText`，可以是字符串或 `(row) => string`。`confirmDelete` 设为 `false` 时跳过确认。批量删除始终确认，文案为「确定要删除选中的 N 条数据吗？」。

## 工具栏

默认工具栏包含新增、批量删除、导入和导出。新增在配置了 `onCreate` 时显示；批量删除在配置了 `onDelete` 或 `onBatchDelete` 时显示，未选中行时禁用。导入和导出默认显示，可通过 `showImport`、`showExport` 隐藏。

```vue
<CrudPage
  permission-code="system:user"
  :on-create="createUser"
  :on-delete="deleteUser"
  import-url="/api/system/user/import"
  export-url="/api/system/user/export"
  @toolbar-action="handleToolbarAction"
/>
```

`permissionCode` 未传时回退到 `tableProps.permissionCode`。导入、导出和行内按钮按下面的权限码控制；新增和批量删除目前只看是否配置了对应处理函数。

| 操作 | 权限码                     |
| ---- | -------------------------- |
| 查看 | `${permissionCode}:query`  |
| 编辑 | `${permissionCode}:edit`   |
| 复制 | `${permissionCode}:copy`   |
| 删除 | `${permissionCode}:remove` |
| 导入 | `${permissionCode}:import` |
| 导出 | `${permissionCode}:export` |

传入 `importUrl` 后会自动使用内置 `ImportDialog` 完成文件上传。它可以是字符串（表示导入接口），也可以是对象，同时配置 `api`、`templateUrl` 和 `templateMethod`。需要调整导入弹窗时，通过 `tableProps.importDialog` 传入，`importUrl` 会覆盖其中同名配置。

导出按以下顺序处理：

1. 配置了 `onExport`：执行自定义逻辑
2. 配置了 `exportUrl`：请求接口并按响应头下载文件
3. 两者都没有：触发 `toolbar-action`，载荷为 `export`

工具栏可以通过 `pushToolbarActions` 在默认按钮后追加按钮，不影响表格行内的 `pushActions`：

```vue
<CrudPage
  :push-toolbar-actions="[
    { name: 'audit', label: '审核', type: 'success' },
    {
      component: () =>
        h(ElButton, { type: 'warning', onClick: handleArchive }, () => '归档'),
    },
  ]"
  @toolbar-action="handleToolbarAction"
/>
```

无 `component` 时必须同时提供 `name` 和 `label`，点击后通过 `toolbar-action` 回传 `name`。传入 `component` 后忽略 `name`、`label`、`type`，由组件或 `() => VNode` 自行处理事件。

行内追加按钮放在 `tableProps.pushActions`，点击走 `action` 事件，载荷为 `{ action, row }`。

## 行操作

未传 `actions` 时，配置了 `onUpdate` 自动带上 `edit`，配置了 `onDelete` 自动带上 `delete`。查看和复制需要显式列入 `actions`。

| action   | 行为                             |
| -------- | -------------------------------- |
| `view`   | 以查看模式打开抽屉               |
| `edit`   | 以编辑模式打开抽屉               |
| `copy`   | 以该行数据打开新增抽屉           |
| `delete` | 调用 `onDelete`                  |
| 其他     | 只触发 `action` 事件，由页面处理 |

所有行操作都会先触发 `action`，内置操作随后继续执行。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fields` | `CrudPageField[]` | `[]` | 字段元数据 |
| `data` | `Record[] \| TableEntityDataFetcher` | `[]` | 表格数据或取数函数 |
| `rowKey` | `string` | `'id'` | 行唯一标识，新增时会从提交值中移除 |
| `actions` | `TableEntityActionName[]` | 按处理函数推导 | 行内按钮：`view`、`edit`、`copy`、`delete` |
| `pushToolbarActions` | `CrudPageToolbarAction[]` | `[]` | 追加到默认工具栏之后 |
| `permissionCode` | `string` | `tableProps.permissionCode` | 按钮权限前缀 |
| `showImport` | `boolean` | `true` | 是否显示导入按钮 |
| `showExport` | `boolean` | `true` | 是否显示导出按钮 |
| `createTitle` | `string` | `'新增'` | 新增抽屉标题 |
| `editTitle` | `string` | `'编辑'` | 编辑抽屉标题 |
| `viewTitle` | `string` | `'详情'` | 查看抽屉标题 |
| `addButtonText` | `string` | `'新增'` | 新增按钮文字 |
| `defaultValues` | `Record` | `{}` | 新增时合并进表单的默认值 |
| `importUrl` | `string \| { api?: string; templateUrl?: string; templateMethod?: 'GET' \| 'POST' }` | — | 导入接口配置；字符串表示导入接口，对象可同时配置导入和模板下载接口 |
| `exportUrl` | `string` | — | 导出接口，点击后下载文件 |
| `confirmDelete` | `boolean` | `true` | 单行删除是否确认 |
| `deleteConfirmText` | `string \| (row) => string` | `'确定要删除这条数据吗？'` | 单行删除确认文案 |
| `searchFormProps` | `CrudPageSearchFormProps` | `{}` | 搜索表单布局。可设 `schema`、`columns`、`collapsedRows`、`labelWidth` 等 |
| `tableProps` | `Partial<TableEntlty>` | `{}` | 透传给 `TableEntity`，不含 `columns`、`data`、`rowKey` |
| `drawerProps` | `Partial<DrawerFormPageProps>` | `{}` | 透传给抽屉，不含 `schema`、`title`、`mode`、`formValues`、`modelValue` |
| `onCreate` | `CrudPageCreateHandler` | — | 新增提交 |
| `onUpdate` | `CrudPageUpdateHandler` | — | 编辑提交 |
| `onDelete` | `CrudPageDeleteHandler` | — | 删除 |
| `onBatchDelete` | `CrudPageBatchDeleteHandler` | — | 批量删除 |
| `onExport` | `CrudPageToolbarHandler` | — | 自定义导出 |
| `resolveFormValues` | `CrudPageFormValuesResolver` | — | 编辑或查看时补充详情 |

## Events

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `action` | `{ action: string, row }` | 行操作点击，内置操作也会触发 |
| `toolbar-action` | `string` | 工具栏追加按钮的 `name`，或未配置导出方式时的 `export` |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `prepend` | 搜索表单上方的内容 |
| `search` | 替换整个查询表单，作用域参数为 `values`、`search(values?)` 和 `reset(values?)` |
| `buttons` | 替换整段默认工具栏 |
| `{prop}Col` | 自定义表格列，作用域同 `TableEntity` |
| `actionsCol` | 自定义操作列 |
| `{prop}` | 字段 `type: 'slot'` 时的表单插槽，同时传给搜索表单和抽屉 |
| `header` / `footer` / `default` | 传给抽屉 |

列插槽名以 `Col` 结尾；除 `search` 外，其余具名插槽按表单插槽转发给搜索表单和抽屉。

使用 `search` 插槽时，内置查询表单会被替换。`values` 是可直接绑定的响应式查询条件；调用 `search()` 提交当前值，或传入一组值提交；调用 `reset()` 清空条件并刷新，亦可传入自定义默认值：

```vue
<CrudPage :fields="fields" :data="data">
  <template #search="{ values, search, reset }">
    <form class="custom-search" @submit.prevent="search()">
      <el-input v-model="values.name" placeholder="名称" />
      <el-button native-type="submit" type="primary">查询</el-button>
      <el-button native-type="button" @click="reset()">重置</el-button>
    </form>
  </template>
</CrudPage>
```

## 暴露方法

```ts
const pageRef = ref<InstanceType<typeof CrudPage>>();

pageRef.value?.openCreate();
pageRef.value?.openEdit(row);
pageRef.value?.openView(row);
pageRef.value?.reload(); // 可传页码，例如 reload(1)
pageRef.value?.close();
pageRef.value?.drawerApi; // DrawerFormPage 实例方法
```
