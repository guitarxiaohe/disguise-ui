# TableEntity 表格

基于 Element Plus `ElTableV2` 封装的虚拟化表格，支持选择、分页、树形、操作列和内置单元格。

<script setup>
import Basic from './demos/table-entity-basic.vue'
import basicSource from './demos/table-entity-basic.vue?raw'
import Cells from './demos/table-entity-cells.vue'
import cellsSource from './demos/table-entity-cells.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="basicSource">
    <Basic />
  </DemoBlock>
</ClientOnly>

## 内置单元格

列配置 `type` 可直接使用内置单元格，不必写插槽。

<ClientOnly>
  <DemoBlock :source="cellsSource">
    <Cells />
  </DemoBlock>
</ClientOnly>

| type | 说明 |
| --- | --- |
| `dict` | 配合 `dictCode` 展示字典标签 |
| `picture` | 缩略图，点击预览，底层是 [ImagesView](/components/images-view) |
| `file` | 附件图标 |
| `avatar` | 读取行上的用户字段展示头像信息 |
| `listExpand` | 超过条数后折叠 |

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `Record[] \| TableEntityDataFetcher` | `[]` | 数组或异步取数 |
| `columns` | `ColumnsItem[]` | `[]` | 列配置 |
| `height` | `number` | `630` | 表格高度 |
| `rowKey` | `string` | `'id'` | 行唯一标识 |
| `selectable` | `boolean` | `true` | 是否显示选择列 |
| `showPagination` | `boolean` | `true` | 是否显示分页 |
| `per_page` | `number` | `100` | 每页条数 |
| `showActions` | `boolean` | `true` | 是否显示操作列 |
| `actions` | `TableEntityActionName[]` | `['edit','delete']` | 内置操作按钮 |
| `tree` | `boolean` | `false` | 树形表格 |

异步数据源会收到 `current_page`、`per_page`、`query`、`sortField`、`sortOrder`。

## 暴露方法

```ts
tableRef.value?.reload();
tableRef.value?.getSelectedRows();
tableRef.value?.clearSelection();
```
