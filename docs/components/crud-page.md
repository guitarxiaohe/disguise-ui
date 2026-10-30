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
| `permissionCode` | `string` | — | 按钮权限前缀 |
| `showImport` | `boolean` | `true` | 是否显示导入 |
| `showExport` | `boolean` | `true` | 是否显示导出 |
| `tableProps` | `Partial<TableEntlty>` | `{}` | 透传给表格 |
| `drawerProps` | `Partial<DrawerFormPageProps>` | `{}` | 透传给抽屉 |
| `searchFormProps` | `CrudPageSearchFormProps` | `{}` | 搜索表单布局 |

## 暴露方法

```ts
pageRef.value?.openCreate();
pageRef.value?.openEdit(row);
pageRef.value?.openView(row);
pageRef.value?.reload(); // 可传页码
pageRef.value?.close();
```
