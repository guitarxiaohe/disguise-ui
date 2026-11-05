# TableEntity 表格

基于 Element Plus `ElTableV2` 封装的虚拟化表格，支持选择、分页、树形、操作列和内置单元格。

<script setup>
import Basic from './demos/table-entity-basic.vue'
import basicSource from './demos/table-entity-basic.vue?raw'
import Cells from './demos/table-entity-cells.vue'
import cellsSource from './demos/table-entity-cells.vue?raw'
import TreeDrag from './demos/table-entity-tree-drag.vue'
import treeDragSource from './demos/table-entity-tree-drag.vue?raw'
import Actions from './demos/table-entity-actions.vue'
import actionsSource from './demos/table-entity-actions.vue?raw'
import ColSlots from './demos/table-entity-slots.vue'
import colSlotsSource from './demos/table-entity-slots.vue?raw'
import AsyncData from './demos/table-entity-async.vue'
import asyncDataSource from './demos/table-entity-async.vue?raw'
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

| type         | 说明                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `dict`       | 配合 `dictCode` 展示字典标签                                                                                                |
| `picture`    | 缩略图，点击预览，底层是 [ImagesView](/components/images-view)                                                              |
| `file`       | 附件图标                                                                                                                    |
| `avatar`     | 读取行上用户字段展示头像信息与详情抽屉，字段同 [UserAvatarInfo](/components/user-avatar-info) props，`cellProps` 可按行补充 |
| `listExpand` | 超过条数后折叠，条数 / 单位通过 `cellProps`（`max`、`unit`、`labelKey`、`html`）配置                                        |
| `price`      | 价格数值红色展示，可带划线原价；`cellProps` 支持 `unit`、`toFixed`、`style`、`oldPrice`（行内原价字段名）、`oldPriceStyle`  |

## 树形拖动排序

树形模式传入 `row-draggable` 后可拖动节点调整**同级顺序**，不会跨父节点改变层级。完成后会触发 `row-sort`，`rows` 是更新后的完整树，可写回数据源。

<ClientOnly>
  <DemoBlock :source="treeDragSource">
    <TreeDrag />
  </DemoBlock>
</ClientOnly>

## 操作列

`show-actions` 默认开启，表格会在右侧固定一列操作。`actions` 控制内置按钮（查看 / 编辑 / 复制 / 删除，默认 `['edit','delete']`），`push-actions` 在其后追加自定义按钮；可见操作超过 1 个时统一收进 `...` 悬停下拉菜单。点击内置按钮触发 `handle-action`。

<ClientOnly>
  <DemoBlock :source="actionsSource">
    <Actions />
  </DemoBlock>
</ClientOnly>

## 自定义列插槽

插槽名为 `{dataKey}Col`，优先级高于内置单元格与默认文本渲染，参数为 `{ row, value, cellData, column, rowIndex }`。

<ClientOnly>
  <DemoBlock :source="colSlotsSource">
    <ColSlots />
  </DemoBlock>
</ClientOnly>

## 异步数据源

`data` 传入函数时进入异步模式：分页、排序、工具栏刷新都会以 `{ current_page, page, per_page, query, sortField, sortOrder }` 调用该函数，返回 `{ rows, total }`，工具栏同时出现刷新按钮。

<ClientOnly>
  <DemoBlock :source="asyncDataSource">
    <AsyncData />
  </DemoBlock>
</ClientOnly>

## Props

| 名称                     | 类型                                 | 默认值                 | 说明                                                                                             |
| ------------------------ | ------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------ |
| `data`                   | `Record[] \| TableEntityDataFetcher` | `[]`                   | 数组或异步取数                                                                                   |
| `columns`                | `ColumnsItem[]`                      | `[]`                   | 列配置                                                                                           |
| `height`                 | `number`                             | `630`                  | 表格高度                                                                                         |
| `rowHeight`              | `number`                             | `40`                   | 行高                                                                                             |
| `cache`                  | `number`                             | `1`                    | 可视区外预渲染行数                                                                               |
| `width`                  | `number`                             | 容器宽度               | 表格宽度                                                                                         |
| `rowKey`                 | `string`                             | `'id'`                 | 行唯一标识                                                                                       |
| `selectable`             | `boolean`                            | `true`                 | 是否显示选择列                                                                                   |
| `multiple`               | `boolean`                            | `true`                 | 是否多选                                                                                         |
| `selectedKeys`           | `any[]`                              | `[]`                   | 受控选中主键                                                                                     |
| `showPagination`         | `boolean`                            | `true`                 | 是否显示分页                                                                                     |
| `per_page`               | `number`                             | `100`                  | 每页条数                                                                                         |
| `current_page`           | `number`                             | `1`                    | 当前页码                                                                                         |
| `total`                  | `number`                             | 内部总数               | 外部控制总条数                                                                                   |
| `query`                  | `Record<string, any>`                | `{}`                   | 异步数据源查询条件                                                                               |
| `showActions`            | `boolean`                            | `true`                 | 是否显示操作列                                                                                   |
| `actions`                | `TableEntityActionName[]`            | `['edit','delete']`    | 内置操作按钮                                                                                     |
| `pushActions`            | `TableEntityPushAction[]`            | `[]`                   | 追加自定义行操作                                                                                 |
| `actionColumnTitle`      | `string`                             | `''`（内置“操作”文案） | 操作列标题                                                                                       |
| `actionColumnWidth`      | `number`                             | `50`                   | 操作列宽度兼容配置；当前内部固定为 50px                                                          |
| `maxVisibleActions`      | `number`                             | —                      | 已弃用的兼容属性；多个操作统一进入更多菜单                                                       |
| `tree`                   | `boolean`                            | `false`                | 树形表格                                                                                         |
| `treeChildrenKey`        | `string`                             | `'children'`           | 子节点字段名                                                                                     |
| `expandColumnKey`        | `string`                             | `''`                   | 展开图标所在列的 key；为空时取第一列                                                             |
| `expandedRowKeys`        | `TableEntityRowKey[]`                | —                      | 受控展开主键                                                                                     |
| `defaultExpandedRowKeys` | `TableEntityRowKey[]`                | `[]`                   | 默认展开主键                                                                                     |
| `indentSize`             | `number`                             | `12`                   | 树节点缩进，单位 px                                                                              |
| `iconSize`               | `number`                             | `12`                   | 展开图标尺寸，单位 px                                                                            |
| `rowDraggable`           | `boolean`                            | `false`                | 显示拖拽把手；树形时只允许同级节点排序                                                           |
| `rowDragHandle`          | `string`                             | —                      | 自定义拖拽把手选择器                                                                             |
| `rowDragDisabled`        | `(row) => boolean`                   | —                      | 禁止指定行拖动                                                                                   |
| `resizable`              | `boolean`                            | `true`                 | 是否允许拖动列宽                                                                                 |
| `minColumnWidth`         | `number`                             | `30`                   | 最小列宽                                                                                         |
| `showColumnSettings`     | `boolean`                            | `true`                 | 是否显示列设置                                                                                   |
| `permissionCode`         | `string`                             | `''`                   | 操作权限前缀，拼成 `前缀:操作` 校验（`delete` → `remove`、`view` → `query`），无权限的按钮不渲染 |
| `importDialog`           | `TableEntityImportDialogConfig`      | —                      | 内置导入弹窗配置                                                                                 |

异步数据源会收到 `current_page`（及兼容别名 `page`）、`per_page`、`query`、`sortField`、`sortOrder`。

`row-sort` 事件的 `oldIndex`/`newIndex` 表示所在层级的数组位置；树形排序时 `rows` 返回完整的重排后树，`parentRowKey` 标明被排序节点的父节点 key（根节点时为 `null`）。

## 列配置 ColumnsItem

`columns` 的每一项在 ElTable 列配置（`title`、`key`、`align`、`fixed`、`cellRenderer`、`headerCellRenderer` 等）基础上扩展以下字段：

| 名称              | 类型                                                                                 | 默认值   | 说明                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------- |
| `width`           | `number`                                                                             | `120`    | 列宽；不传时按 120 计算并自动补满容器宽度                                              |
| `dataKey`         | `string`                                                                             | —        | 单元格取值字段（ElTableV2 命名）                                                       |
| `dataIndex`       | `string`                                                                             | —        | `dataKey` 的兼容别名，二者取其一即可                                                   |
| `headerAlign`     | `'left' \| 'center' \| 'right'`                                                      | `'left'` | 表头对齐方式                                                                           |
| `align`           | `'left' \| 'center' \| 'right'`                                                      | `'left'` | 单元格内容水平对齐方式                                                                 |
| `verticalAlign`   | `'top' \| 'center' \| 'bottom'`                                                      | —        | 单元格内容垂直对齐方式                                                                 |
| `type`            | `TableEntityCellType`                                                                | —        | 内置单元格类型，取值见「内置单元格」章节                                               |
| `dictCode`        | `string`                                                                             | —        | 字典编码，`type: 'dict'` 时使用                                                        |
| `dictType`        | `string`                                                                             | —        | 同 `dictCode`，兼容 dict-tag 的旧命名                                                  |
| `maxPreviewCount` | `number`                                                                             | `3`      | `picture` / `file` 最多展示数量，超出显示 `+N`                                         |
| `cellProps`       | `Record<string, any>` \| `({ row, value, rowIndex, column }) => Record<string, any>` | `{}`     | 内置单元格透传属性，`picture` 会继续传给 ImagesView；函数形式可按当前行数据返回配置    |
| `props`           | 同 `cellProps`                                                                       | `{}`     | 同 `cellProps`，兼容写法                                                               |
| `sortable`        | `boolean`                                                                            | `false`  | 允许点击表头触发服务端排序                                                             |
| `sortOrder`       | `'asc' \| 'desc'`                                                                    | —        | 初始排序方向；设置后该列表头也可点击排序                                               |
| `valueType`       | `'date' \| 'datetime'`                                                               | —        | 按日期格式化展示（`YYYY-MM-DD` / 含时分秒）；字段为空时回退常见的创建 / 更新时间字段名 |

## Events

| 名称                                                 | 参数                                      | 说明           |
| ---------------------------------------------------- | ----------------------------------------- | -------------- |
| `update:selectedKeys` / `selection-change`           | `keys / rows`                             | 选择变化       |
| `update:current_page` / `update:page` / `pageChange` | `page`                                    | 页码变化       |
| `update:per_page`                                    | `size`                                    | 每页条数变化   |
| `change`                                             | `TableEntityChangePayload`                | 分页或排序变化 |
| `refresh`                                            | —                                         | 点击刷新       |
| `handle-action`                                      | `{ action, row }`                         | 点击行操作     |
| `update:expandedRowKeys` / `expandedRowsChange`      | `keys`                                    | 展开行变化     |
| `rowExpand`                                          | `{ expanded, rowData, rowIndex, rowKey }` | 单行展开变化   |
| `rowSort`                                            | `TableEntityRowSortPayload`               | 拖动完成       |
| `importSuccess` / `importError`                      | `result / error`                          | 导入结果       |

## Slots

| 名称           | 插槽参数                                     | 说明           |
| -------------- | -------------------------------------------- | -------------- |
| `buttons`      | —                                            | 表格工具栏按钮 |
| `{dataKey}Col` | `{ row, value, cellData, column, rowIndex }` | 自定义指定列   |
| `actionsCol`   | 同列插槽                                     | 完整接管操作列 |

## 暴露方法

```ts
tableRef.value?.reload(); // 重新加载当前页（异步数据源）
tableRef.value?.reload(2); // 跳到第 2 页并加载
tableRef.value?.getSelectedRows();
tableRef.value?.clearSelection();
tableRef.value?.getSelectedCount();
tableRef.value?.setSelectedKeys([1, 2]);
tableRef.value?.openImport(); // 打开内置导入弹窗，未配置 importDialog 时返回 false
```
