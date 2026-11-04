# CrudPage 增删改查页

`CrudPage` 使用一份字段元数据，同时生成搜索表单、`TableEntity` 和 `DrawerFormPage`。

<script setup>
import Basic from './demos/crud-page-basic.vue'
import source from './demos/crud-page-basic.vue?raw'
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

## 字段

字段类型与 `SchemaForm` 相同。表格列由字段生成：`prop` 映射为 `dataIndex` / `key`，`label` 映射为 `title`。

| 配置 | 说明 |
| --- | --- |
| `table` | 默认出现在表格。对象会合并进列配置 |
| `table: false` | 不出现在表格 |
| `form: false` | 不出现在抽屉表单 |
| `search: true` | 复用字段配置生成搜索项 |
| `type: 'group'` | 只用于表单和搜索，不会生成表格列 |

`hidden`、`disabled`、`required`、`options` 和 `props` 都可以是函数，读取当前 `mode` 和 `values`。

## 提交与删除

| 处理函数 | 调用时机 |
| --- | --- |
| `onCreate(values)` | 新增提交。返回 `false` 时不关闭、不刷新 |
| `onUpdate(values, row)` | 编辑提交 |
| `onDelete(row)` | 行内删除 |
| `onBatchDelete(rows)` | 批量删除，优先级高于逐行 `onDelete` |
| `resolveFormValues(mode, row)` | 编辑或查看打开前拉取详情 |

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fields` | `CrudPageField[]` | `[]` | 字段元数据 |
| `data` | `Record[] \| TableEntityDataFetcher` | `[]` | 表格数据或取数函数 |
| `rowKey` | `string` | `'id'` | 行唯一标识 |
| `actions` | `TableEntityActionName[]` | 按处理函数推导 | 行内按钮 |
| `pushToolbarActions` | `CrudPageToolbarAction[]` | `[]` | 追加工具栏操作 |
| `createTitle` / `editTitle` / `viewTitle` | `string` | 新增 / 编辑 / 详情 | 抽屉标题 |
| `addButtonText` | `string` | `'新增'` | 新增按钮文案 |
| `permissionCode` | `string` | — | 按钮权限前缀 |
| `showImport` | `boolean` | `true` | 是否显示导入 |
| `showExport` | `boolean` | `true` | 是否显示导出 |
| `importUrl` | `string \| ImportDialogUrlConfig` | — | 导入接口配置 |
| `exportUrl` | `string` | — | 导出接口地址 |
| `defaultValues` | `Record<string, any>` | `{}` | 新增默认值 |
| `confirmDelete` | `boolean` | `true` | 删除前是否确认 |
| `deleteConfirmText` | `string \| (row) => string` | 内置文案 | 删除确认文案 |
| `tableProps` | `Partial<TableEntityProps>` | `{}` | 透传给表格 |
| `drawerProps` | `Partial<DrawerFormPageProps>` | `{}` | 透传给抽屉 |
| `searchFormProps` | `CrudPageSearchFormProps` | `{}` | 搜索表单布局 |
| `onCreate` / `onUpdate` | `Function` | — | 新增、更新处理函数 |
| `onDelete` / `onBatchDelete` | `Function` | — | 单行、批量删除处理函数 |
| `exportConfig` | `ExportConfig` | — | 自定义导出配置 |
| `resolveFormValues` | `(mode, row?) => Record \| Promise<Record>` | — | 打开表单前补充数据 |

## Events

| 名称 | 参数 | 说明 |
| --- | --- | --- |
| `action` | `{ action, row }` | 表格行操作 |
| `rowSort` | `TableEntityRowSortPayload` | 行拖动完成 |
| `toolbarAction` | `action: string` | 点击追加的普通工具栏按钮 |

## Slots

| 名称 | 插槽参数 | 说明 |
| --- | --- | --- |
| `prepend` | — | 搜索区之前的内容 |
| `search` | `{ values, search, reset }` | 完整接管搜索区域 |
| `buttons` | `{ selectedRows }` | 完整接管工具栏按钮 |
| `{dataKey}Col` | `{ row, value, cellData, column, rowIndex }` | 自定义表格列 |
| `actionsCol` | 同列插槽 | 完整接管操作列 |
| `{fieldProp}` | `{ field, value, disabled, updateValue }` | 自定义搜索和抽屉字段 |
| `header` | `{ fullscreen, title, toggleFullscreen }` | 抽屉头部 |
| `footer` | `{ cancel, submit, submitting }` | 抽屉底部 |
| `default` | — | 追加到抽屉表单之后 |

## 暴露方法

```ts
pageRef.value?.openCreate();
pageRef.value?.openEdit(row);
pageRef.value?.openView(row);
pageRef.value?.reload(); // 可传页码
pageRef.value?.close();
```
