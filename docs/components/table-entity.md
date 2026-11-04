# TableEntity 表格

基于 Element Plus `ElTableV2` 封装的虚拟化表格，支持选择、分页、树形、操作列和内置单元格。

<script setup>
import Basic from './demos/table-entity-basic.vue'
import basicSource from './demos/table-entity-basic.vue?raw'
import Cells from './demos/table-entity-cells.vue'
import cellsSource from './demos/table-entity-cells.vue?raw'
import TreeDrag from './demos/table-entity-tree-drag.vue'
import treeDragSource from './demos/table-entity-tree-drag.vue?raw'
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

## 树形拖动排序

树形模式传入 `row-draggable` 后可拖动节点调整**同级顺序**，不会跨父节点改变层级。完成后会触发 `row-sort`，`rows` 是更新后的完整树，可写回数据源。

<ClientOnly>
  <DemoBlock :source="treeDragSource">
    <TreeDrag />
  </DemoBlock>
</ClientOnly>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `Record[] \| TableEntityDataFetcher` | `[]` | 数组或异步取数 |
| `columns` | `ColumnsItem[]` | `[]` | 列配置 |
| `height` | `number` | `630` | 表格高度 |
| `rowHeight` | `number` | `40` | 行高 |
| `cache` | `number` | `1` | 可视区外预渲染行数 |
| `width` | `number` | 容器宽度 | 表格宽度 |
| `rowKey` | `string` | `'id'` | 行唯一标识 |
| `selectable` | `boolean` | `true` | 是否显示选择列 |
| `multiple` | `boolean` | `true` | 是否多选 |
| `selectedKeys` | `any[]` | `[]` | 受控选中主键 |
| `showPagination` | `boolean` | `true` | 是否显示分页 |
| `per_page` | `number` | `100` | 每页条数 |
| `current_page` | `number` | `1` | 当前页码 |
| `total` | `number` | 内部总数 | 外部控制总条数 |
| `query` | `Record<string, any>` | `{}` | 异步数据源查询条件 |
| `showActions` | `boolean` | `true` | 是否显示操作列 |
| `actions` | `TableEntityActionName[]` | `['edit','delete']` | 内置操作按钮 |
| `pushActions` | `TableEntityPushAction[]` | `[]` | 追加自定义行操作 |
| `actionColumnTitle` | `string` | 内置文案 | 操作列标题 |
| `actionColumnWidth` | `number` | `50` | 操作列宽度兼容配置；当前内部固定为 50px |
| `maxVisibleActions` | `number` | — | 已弃用的兼容属性；多个操作统一进入更多菜单 |
| `tree` | `boolean` | `false` | 树形表格 |
| `treeChildrenKey` | `string` | `'children'` | 子节点字段名 |
| `expandColumnKey` | `string` | `''` | 展开图标所在列的 key |
| `expandedRowKeys` | `TableEntityRowKey[]` | — | 受控展开主键 |
| `defaultExpandedRowKeys` | `TableEntityRowKey[]` | `[]` | 默认展开主键 |
| `indentSize` | `number` | `12` | 树节点缩进，单位 px |
| `iconSize` | `number` | `12` | 展开图标尺寸，单位 px |
| `rowDraggable` | `boolean` | `false` | 显示拖拽把手；树形时只允许同级节点排序 |
| `rowDragHandle` | `string` | — | 自定义拖拽把手选择器 |
| `rowDragDisabled` | `(row) => boolean` | — | 禁止指定行拖动 |
| `resizable` | `boolean` | `true` | 是否允许拖动列宽 |
| `minColumnWidth` | `number` | `30` | 最小列宽 |
| `showColumnSettings` | `boolean` | `true` | 是否显示列设置 |
| `permissionCode` | `string` | `''` | 操作权限前缀 |
| `importDialog` | `TableEntityImportDialogConfig` | — | 内置导入弹窗配置 |

异步数据源会收到 `current_page`、`per_page`、`query`、`sortField`、`sortOrder`。

`row-sort` 事件的 `oldIndex`/`newIndex` 表示所在层级的数组位置；树形排序时 `rows` 返回完整的重排后树，`parentRowKey` 标明被排序节点的父节点 key（根节点时为 `null`）。

## Events

| 名称 | 参数 | 说明 |
| --- | --- | --- |
| `update:selectedKeys` / `selection-change` | `keys / rows` | 选择变化 |
| `update:current_page` / `pageChange` | `page` | 页码变化 |
| `update:per_page` | `size` | 每页条数变化 |
| `change` | `TableEntityChangePayload` | 分页或排序变化 |
| `refresh` | — | 点击刷新 |
| `handle-action` | `{ action, row }` | 点击行操作 |
| `update:expandedRowKeys` / `expandedRowsChange` | `keys` | 展开行变化 |
| `rowExpand` | `{ expanded, rowData, rowIndex, rowKey }` | 单行展开变化 |
| `rowSort` | `TableEntityRowSortPayload` | 拖动完成 |
| `importSuccess` / `importError` | `result / error` | 导入结果 |

## Slots

| 名称 | 插槽参数 | 说明 |
| --- | --- | --- |
| `buttons` | — | 表格工具栏按钮 |
| `{dataKey}Col` | `{ row, value, cellData, column, rowIndex }` | 自定义指定列 |
| `actionsCol` | 同列插槽 | 完整接管操作列 |

## 暴露方法

```ts
tableRef.value?.reload();
tableRef.value?.getSelectedRows();
tableRef.value?.clearSelection();
tableRef.value?.getSelectedCount();
tableRef.value?.setSelectedKeys([1, 2]);
tableRef.value?.openImport();
```
