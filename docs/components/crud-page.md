# CrudPage 增删改查页

`CrudPage` 使用一份字段元数据，同时生成搜索表单、`TableEntity` 和 `DrawerFormPage`。

<script setup>
import Basic from './demos/crud-page-basic.vue'
import source from './demos/crud-page-basic.vue?raw'
import Full from './demos/crud-page-full.vue'
import fullSource from './demos/crud-page-full.vue?raw'
import Batch from './demos/crud-page-batch.vue'
import batchSource from './demos/crud-page-batch.vue?raw'
import Sort from './demos/crud-page-sort.vue'
import sortSource from './demos/crud-page-sort.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
    <template #description>
      查询、新增、编辑、删除都写在这一页里。数据存在内存中，刷新页面会恢复初始示例。
    </template>
  </DemoBlock>
</ClientOnly>

`data` 支持两种形态：

- 数组：直接作为表格数据
- 函数：签名同 `TableEntityDataFetcher`，分页、排序和搜索条件由表格传入

搜索提交后，当前搜索值会作为 `query` 传给数据函数。

## 全量示例

一份 `fields` 同时覆盖 `SchemaForm` 的全部控件类型和 `TableEntity` 的全部内置单元格，字段定义抽在 `docs/components/demos/crud-page-schema.ts`。

<ClientOnly>
  <DemoBlock :source="fullSource">
    <Full />
    <template #description>
      点「新增」打开抽屉可以看到全部表单控件；表格里有字典、图片、附件、头像、列表展开和价格单元格。搜索字段超过一行时自动折叠。
    </template>
  </DemoBlock>
</ClientOnly>

| 侧   | 覆盖内容                                                                                                                                                                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 表单 | `text`、`textarea`、`number`、`select`、`radio`、`checkbox`、`switch`、`date`、`datetime`、`cascader`、`async-select`、`picture`、`file`、`upload`、`rich-text`、`slot`、`component`、`group` |
| 表格 | `dict`、`picture`、`file`、`avatar`、`listExpand`、`price` 单元格，以及 `valueType: 'date' / 'datetime'` 日期列                                                                               |

## 字段

字段类型与 `SchemaForm` 相同。表格列由**顶层字段**生成（分组子字段不生成列）：`prop` 映射为 `dataIndex` / `key`，`label` 映射为 `title`。

| 配置            | 说明                                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| `table`         | 默认出现在表格；对象会合并进列配置，`dataIndex` / `key` / `title` 缺省取 `prop` / `prop` / `label`             |
| `table: false`  | 不出现在表格                                                                                                   |
| `form: false`   | 不出现在抽屉表单                                                                                               |
| `search: true`  | 复用字段配置生成搜索项；只有**顶层字段**参与搜索                                                               |
| `search: 对象`  | 覆盖搜索项配置（`label`、`hidden`、`required`、`props`、`options` 等），未列入搜索配置的键会合并进控件 `props` |
| `type: 'group'` | 只用于表单和搜索，不会生成表格列；分组配置 `search: true` 后组内子字段整体进入搜索区                           |

`hidden`、`disabled`、`required`、`options` 和 `props` 都可以是函数，读取当前 `mode` 和 `values`。

`searchFormProps` 调整搜索区布局，字段与 `SearchForm` 一致：`columns`、`collapsedRows`、`disabled`、`labelAlign`、`labelPosition`、`labelWidth`、`showActions`；其中 `schema` 传入后会完全接管搜索字段，不再由 `fields.search` 生成。

## 提交与删除

| 处理函数                       | 调用时机                                |
| ------------------------------ | --------------------------------------- |
| `onCreate(values)`             | 新增提交。返回 `false` 时不关闭、不刷新 |
| `onUpdate(values, row)`        | 编辑提交                                |
| `onDelete(row)`                | 行内删除                                |
| `onBatchDelete(rows)`          | 批量删除，优先级高于逐行 `onDelete`     |
| `resolveFormValues(mode, row)` | 编辑或查看打开前拉取详情                |

`actions` 不传时按处理函数推导：有 `onUpdate` 加入 `edit`，有 `onDelete` 加入 `delete`；显式传入则覆盖推导结果，`tableProps.showActions` 可单独控制操作列显隐。

## 批量删除与追加工具栏

勾选多行后点「删除选中」：配置了 `onBatchDelete` 时整批一次提交，否则逐行调用 `onDelete`。`pushToolbarActions` 追加的按钮点击后回传 `toolbarAction` 事件。

<ClientOnly>
  <DemoBlock :source="batchSource">
    <Batch />
    <template #description>
      勾选多行点「删除选中」可整批删除；点「同步数据」触发 toolbarAction。
    </template>
  </DemoBlock>
</ClientOnly>

`pushToolbarActions` 每项的字段：

| 字段        | 类型                            | 说明                                                 |
| ----------- | ------------------------------- | ---------------------------------------------------- |
| `name`      | `string`                        | 唯一标识，无 `component` 时用于 `toolbarAction` 回传 |
| `label`     | `string`                        | 按钮文字，无 `component` 时生效                      |
| `type`      | `'primary' \| 'success' \| ...` | 按钮颜色，默认 `'primary'`                           |
| `component` | `Component \| () => VNode`      | 自定义渲染，传入后忽略 `name` / `label` / `type`     |

## 行拖动排序

`tableProps.rowDraggable` 打开行拖动，完成后触发 `row-sort`，参数 `rows` 是排序后的完整数据，写回数据源即可生效。

<ClientOnly>
  <DemoBlock :source="sortSource">
    <Sort />
    <template #description>
      拖动行左侧把手调整顺序，下方会显示位置变化。
    </template>
  </DemoBlock>
</ClientOnly>

## 导入与导出

`importUrl` 传入后自动接入内置 `ImportDialog`（字符串直接作为导入接口，对象会与 `tableProps.importDialog` 合并）。导出用 `exportConfig` 描述下载地址与请求参数，完成后按响应头 `filename` 保存，否则用 `name` 兜底。

```ts
// 导入：string 直接作为导入接口，传入后工具栏出现「导入」按钮
<CrudPage :fields="fields" :data="fetchList" import-url="/api/user/import" />

// 导出：url 为下载地址，onExport 的返回值作为请求体（自动附带 token）
<CrudPage
  :fields="fields"
  :data="fetchList"
  :export-config="{
    url: '/api/user/export',
    name: '用户列表.xlsx',
    onExport: ({ rows, queryParmas }) => ({
      ids: rows.map((row) => row.id),
      ...queryParmas,
    }),
  }"
/>
```

`exportConfig` 字段：

| 字段       | 类型                                | 说明                                                                                        |
| ---------- | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `url`      | `string`                            | 导出下载地址                                                                                |
| `name`     | `string`                            | 兜底文件名，默认 `export.xlsx`                                                              |
| `method`   | `string`                            | 预留字段，当前导出固定走 `requestClient.download`                                           |
| `onExport` | `({ rows, queryParmas }) => Record` | 返回随请求提交的参数；`rows` 为勾选行，`queryParmas` 为当前搜索条件（字段名与类型定义一致） |

`showImport: false` 隐藏导入按钮，`showExport: false` 隐藏导出按钮。导入、导出都依赖后端接口，示例环境未接入。

## Props

| 名称                                      | 类型                                        | 默认值             | 说明                                                |
| ----------------------------------------- | ------------------------------------------- | ------------------ | --------------------------------------------------- |
| `fields`                                  | `CrudPageField[]`                           | `[]`               | 字段元数据                                          |
| `data`                                    | `Record[] \| TableEntityDataFetcher`        | `[]`               | 表格数据或取数函数                                  |
| `rowKey`                                  | `string`                                    | `'id'`             | 行唯一标识                                          |
| `actions`                                 | `TableEntityActionName[]`                   | 按处理函数推导     | 行内按钮                                            |
| `pushToolbarActions`                      | `CrudPageToolbarAction[]`                   | `[]`               | 追加工具栏操作                                      |
| `createTitle` / `editTitle` / `viewTitle` | `string`                                    | 新增 / 编辑 / 详情 | 抽屉标题                                            |
| `addButtonText`                           | `string`                                    | `'新增'`           | 新增按钮文案                                        |
| `permissionCode`                          | `string`                                    | —                  | 按钮权限前缀                                        |
| `showImport`                              | `boolean`                                   | `true`             | 是否显示导入                                        |
| `showExport`                              | `boolean`                                   | `true`             | 是否显示导出                                        |
| `importUrl`                               | `string \| ImportDialogUrlConfig`           | —                  | 导入接口配置                                        |
| `exportUrl`                               | `string`                                    | —                  | 导出接口地址（当前未接入，导出请用 `exportConfig`） |
| `defaultValues`                           | `Record<string, any>`                       | `{}`               | 新增默认值                                          |
| `confirmDelete`                           | `boolean`                                   | `true`             | 删除前是否确认                                      |
| `deleteConfirmText`                       | `string \| (row) => string`                 | 内置文案           | 删除确认文案                                        |
| `tableProps`                              | `Partial<TableEntityProps>`                 | `{}`               | 透传给表格                                          |
| `drawerProps`                             | `Partial<DrawerFormPageProps>`              | `{}`               | 透传给抽屉                                          |
| `searchFormProps`                         | `CrudPageSearchFormProps`                   | `{}`               | 搜索表单布局                                        |
| `onCreate` / `onUpdate`                   | `Function`                                  | —                  | 新增、更新处理函数                                  |
| `onDelete` / `onBatchDelete`              | `Function`                                  | —                  | 单行、批量删除处理函数                              |
| `exportConfig`                            | `ExportConfig`                              | —                  | 自定义导出配置                                      |
| `resolveFormValues`                       | `(mode, row?) => Record \| Promise<Record>` | —                  | 打开表单前补充数据                                  |

## Events

| 名称            | 参数                        | 说明                     |
| --------------- | --------------------------- | ------------------------ |
| `action`        | `{ action, row }`           | 表格行操作               |
| `rowSort`       | `TableEntityRowSortPayload` | 行拖动完成               |
| `toolbarAction` | `action: string`            | 点击追加的普通工具栏按钮 |

## Slots

| 名称           | 插槽参数                                     | 说明                 |
| -------------- | -------------------------------------------- | -------------------- |
| `prepend`      | —                                            | 搜索区之前的内容     |
| `search`       | `{ values, search, reset }`                  | 完整接管搜索区域     |
| `buttons`      | `{ selectedRows }`                           | 完整接管工具栏按钮   |
| `{dataKey}Col` | `{ row, value, cellData, column, rowIndex }` | 自定义表格列         |
| `actionsCol`   | 同列插槽                                     | 完整接管操作列       |
| `{fieldProp}`  | `{ field, value, disabled, updateValue }`    | 自定义搜索和抽屉字段 |
| `header`       | `{ fullscreen, title, toggleFullscreen }`    | 抽屉头部             |
| `footer`       | `{ cancel, submit, submitting }`             | 抽屉底部             |
| `default`      | —                                            | 追加到抽屉表单之后   |

## 暴露方法

| 名称                | 说明                                    |
| ------------------- | --------------------------------------- |
| `openCreate()`      | 打开新增抽屉                            |
| `openEdit(row)`     | 打开编辑抽屉                            |
| `openView(row)`     | 打开查看抽屉                            |
| `reload(page?)`     | 重新加载表格，可指定页码                |
| `close()`           | 关闭抽屉                                |
| `getSearchValues()` | 获取当前搜索条件的副本                  |
| `getSelectedRows()` | 获取表格勾选行                          |
| `clearSelection()`  | 清空表格勾选                            |
| `drawerApi`         | 抽屉 API，同 `useDrawerFormPage` 返回值 |

```ts
pageRef.value?.openCreate();
pageRef.value?.openEdit(row);
pageRef.value?.reload(1); // 可传页码
pageRef.value?.getSelectedRows();
pageRef.value?.drawerApi.setValues({ name: '新名称' });
```
