# TableEntity 表格组件

基于 Element Plus `ElTableV2` 封装的虚拟化表格组件，支持树形数据、行选择、分页、列插槽及内置操作列。

## 基础用法

```vue
<script setup lang="ts">
import { TableEntity } from '@/components';
import type { ColumnsItem } from '@/components/table-entity/index.type';

const columns: ColumnsItem[] = [
  { title: 'ID', dataKey: 'id', key: 'id', width: 80 },
  { title: '名称', dataKey: 'name', key: 'name', width: 200 },
];

const data = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
]);
</script>

<template>
  <TableEntity :data="data" :columns="columns" />
</template>
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `Record[] \| () => Promise<ApiResponse>` | `[]` | 表格数据，支持直接传数组或异步函数 |
| `columns` | `ColumnsItem[]` | `[]` | 列配置，类型同 Element Plus Column |
| `height` | `number` | `400` | 表格高度 |
| `rowHeight` | `number` | `40` | 行高 |
| `width` | `number` | — | 表格宽度，不传则自适应容器 |
| `rowKey` | `string` | `'id'` | 行唯一标识字段 |
| `selectable` | `boolean` | `true` | 是否显示选择列 |
| `multiple` | `boolean` | `true` | 选择模式：`true` 多选，`false` 单选 |
| `selectedKeys` | `any[]` | `[]` | 已选行 key 数组（v-model） |
| `tree` | `boolean` | `false` | 是否展示为树形表格 |
| `treeChildrenKey` | `string` | `'children'` | 子节点字段名 |
| `rowDraggable` | `boolean` | `false` | 显示拖拽把手并允许行排序；树形模式只允许同级节点排序，不会改变父子关系 |
| `rowDragHandle` | `string` | — | 自定义拖拽把手 CSS 选择器；默认自动添加拖拽列 |
| `rowDragDisabled` | `(row) => boolean` | — | 返回 `true` 时该节点不能拖动，也不能作为放置目标 |
| `expandColumnKey` | `string` | — | 树形展开按钮所在列 key，默认第一列 |
| `expandedRowKeys` | `TableEntityRowKey[]` | — | 展开行 keys（受控） |
| `defaultExpandedRowKeys` | `TableEntityRowKey[]` | `[]` | 默认展开行 keys |
| `indentSize` | `number` | `12` | 树形缩进尺寸 |
| `iconSize` | `number` | `12` | 展开图标尺寸 |
| `showPagination` | `boolean` | `true` | 是否显示分页 |
| `total` | `number` | — | 总条数，默认取 data 长度 |
| `per_page` | `number` | `100` | 每页条数 |
| `current_page` | `number` | `1` | 当前页 |
| `showActions` | `boolean` | `false` | 是否显示内置操作列 |
| `actions` | `TableEntityActionName[]` | `['view','edit','copy','delete']` | 需要显示的内置操作按钮 |
| `maxVisibleActions` | `number` | — | 已废弃，仅为兼容保留；操作超过一个时统一收进 `...` 下拉菜单 |
| `actionColumnWidth` | `number` | `50` | 兼容保留，操作列固定为 50px |
| `actionColumnTitle` | `string` | `'操作'` | 操作列标题 |
| `pushActions` | `TableEntityPushAction[]` | `[]` | 追加的自定义操作按钮 |

列配置支持服务端排序：

```ts
const columns = [
  { title: '名称', dataKey: 'name', sortable: true, sortOrder: 'asc' },
];
```

点击可排序列的表头会切换升序/降序，异步数据源会自动收到 `sortField` 和 `sortOrder` 参数。

列元数据支持 `verticalAlign: 'top' | 'center' | 'bottom'`，用于控制单元格内容的垂直对齐方式。

多行内容可以通过 `verticalAlign` 设置垂直对齐方式：

```ts
const columns = [
  {
    title: '名称',
    dataKey: 'name',
    verticalAlign: 'top',
  },
];
```

## Events

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `action` | `{ action: string, row: Record }` | 操作列按钮点击 |
| `selection-change` | `Record[]` | 选中行变化 |
| `update:selectedKeys` | `any[]` | 选中 keys 变化 |
| `expanded-rows-change` | `TableEntityRowKey[]` | 展开行变化 |
| `row-expand` | `{ expanded, rowData, rowIndex, rowKey }` | 单行展开/折叠 |
| `row-sort` | `{ oldIndex, newIndex, rows, parentRowKey? }` | 拖拽排序完成；树模式的索引属于同级数组，`rows` 为重排后的完整树，根节点排序时 `parentRowKey` 为 `null` |
| `page-change` | `number` | 页码变化 |
| `update:current_page` | `number` | 当前页变化 |
| `update:per_page` | `number` | 每页条数变化 |
| `change` | `{ current_page, per_page, sortField?, sortOrder? }` | 分页或排序变化时触发 |

## 列插槽

插槽名为 `{dataKey}Col`，接收 `{ row, value, cellData, column, rowIndex }` 参数。

```vue
<TableEntity :data="data" :columns="columns">
  <!-- 自定义 status 列的渲染 -->
  <template #statusCol="{ row, value }">
    <el-tag :type="value === '1' ? 'success' : 'danger'">
      {{ value === '1' ? '启用' : '停用' }}
    </el-tag>
  </template>
</TableEntity>
```

## 内置单元格类型

列配置 `type` 可直接使用 `cells` 目录下的单元格组件，无需写插槽（插槽优先级更高）。

| type | 值格式 | 说明 |
| --- | --- | --- |
| `dict` | 字典值 | 配合 `dictCode` 展示字典标签 |
| `picture` | URL 字符串（可逗号分隔）、URL 数组、`{ fileUrl }` 数组 | 缩略图，点击预览；相对路径自动拼接 CDN |
| `file` | `AttachmentData` 或其数组 | 图片显示缩略图，其他文件显示类型图标，点击打开 |
| `avatar` | 读取整行 `userId / nickName / userName / avatar / sex / deptName` | 用户头像信息 |

`picture` / `file` 可通过 `maxPreviewCount` 控制最多展示数量（默认 3），超出显示 `+N`。

内置单元格支持通过 `cellProps`（或兼容写法 `props`）透传属性；`picture` 的属性会继续传给 `ImagesView`，例如：

```ts
{
  title: '图片',
  dataKey: 'images',
  type: 'picture',
  cellProps: { size: 48, maxStack: 2, offset: 4 },
}
```

列表超过指定条数时可以折叠。设置 `type: 'listExpand'`，单元格值可以是字符串数组或对象数组。超过 `cellProps.max`（默认 2）条时只显示前面几条，并出现「查看全部 N 个{unit}」，点击后展开整行，再点「收起」收回。

```ts
const columns: ColumnsItem[] = [
  {
    title: '产品',
    dataKey: 'products',
    verticalAlign: 'top',
    type: 'listExpand',
    cellProps: { max: 2, unit: '商品', labelKey: 'name' },
  },
];
```

```ts
const columns: ColumnsItem[] = [
  { title: '图片', dataKey: 'images', type: 'picture', maxPreviewCount: 2 },
  { title: '附件', dataKey: 'attachments', type: 'file' },
  { title: '创建人', dataKey: 'createBy', type: 'avatar', width: 180 },
];
```

## 操作列

### 开启操作列

```vue
<TableEntity show-actions @action="handleAction" />
```

内置四个按钮：查看、编辑、复制、删除。点击触发 `@action` 事件：

当权限过滤后的可见操作超过 1 个时，仅显示 `...`，鼠标悬停后打开包含全部可见操作的下拉菜单；只有 1 个可见操作时直接显示该按钮。

```ts
function handleAction({
  action,
  row,
}: {
  action: string;
  row: Record<string, any>;
}) {
  switch (action) {
    case 'view':
      console.log('查看', row);
      break;
    case 'edit':
      console.log('编辑', row);
      break;
    case 'copy':
      console.log('复制', row);
      break;
    case 'delete':
      console.log('删除', row);
      break;
  }
}
```

### 控制按钮显隐

```vue
<!-- 只显示编辑和删除 -->
<TableEntity
  show-actions
  :actions="['edit', 'delete']"
  @action="handleAction"
/>
```

### 追加自定义按钮

`push-actions` 追加到内置按钮后面，无 `component` 时渲染为默认 `el-button`：

```vue
<TableEntity
  show-actions
  :push-actions="[
    { name: 'approve', label: '审批', type: 'success' },
    { name: 'disable', label: '停用', type: 'warning' },
  ]"
  @action="handleAction"
/>
```

点击时 `emit('action', { action: 'approve', row })`，`action` 值为配置中的 `name`。

### 自定义按钮渲染（component）

传入 `component` 后无需 `name`/`label`/`type`，组件只接收 `{ row }`，完全自主渲染和处理事件。

#### Render 函数（h 函数）

```vue
<script setup>
import { h } from 'vue';
import { ElTag, ElMessage } from 'element-plus';

const pushActions = [
  {
    component: ({ row }) =>
      h(
        ElTag,
        {
          type: row.status === '1' ? 'success' : 'danger',
          style: { cursor: 'pointer' },
          onClick: () => ElMessage.success(`操作了 ${row.menuName}`),
        },
        () => (row.status === '1' ? '启用' : '停用'),
      ),
  },
];
</script>

<template>
  <TableEntity show-actions :push-actions="pushActions" />
</template>
```

#### 引入 Vue 组件

```vue
<script setup>
import MyActionBtn from './MyActionBtn.vue';

const pushActions = [{ component: MyActionBtn }];
</script>
```

组件只需声明 `row` prop，事件、逻辑完全自理：

```vue
<!-- MyActionBtn.vue -->
<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus';
import { deleteMenu } from '@/api/modules/system/menu';

const props = defineProps<{
  row: Record<string, any>;
}>();

const emits = defineEmits<{ done: [] }>();

function handleDelete() {
  ElMessageBox.confirm(`确定删除「${props.row.menuName}」？`, '提示', {
    type: 'warning',
  })
    .then(async () => {
      await deleteMenu(props.row.menuId);
      ElMessage.success('已删除');
      emits('done');
    })
    .catch(() => {});
}
</script>

<template>
  <el-button type="danger" link size="small" @click="handleDelete"
    >删除</el-button
  >
</template>
```

### 完全自定义操作列（插槽）

如果需要彻底接管整个操作列的渲染，使用 `#actionsCol` 插槽：

```vue
<TableEntity show-actions :data="data" :columns="columns">
  <template #actionsCol="{ row }">
    <el-dropdown @command="(cmd) => handleAction({ action: cmd, row })">
      <el-button type="primary" link size="small">更多 ▾</el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="view">查看</el-dropdown-item>
          <el-dropdown-item command="edit">编辑</el-dropdown-item>
          <el-dropdown-item command="delete">删除</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </template>
</TableEntity>
```

### 操作列扩展层级总结

| 层级 | 用法 | 适合场景 |
| --- | --- | --- |
| prop 调按钮 | `:actions="['view','edit']"` | 内置按钮够用，调顺序和显隐 |
| push-actions | `:push-actions="[{ name, label }]"` | 追加新按钮，走 `@action` 事件 |
| push-actions + component | `{ component: MyComp }` 或 `{ component: ({ row }) => ... }` | 组件自主渲染，拿 `row` 自己处理一切 |
| 插槽 `#actionsCol` | 完全自己写 | 下拉菜单、多级操作等复杂 UI |

## 组件暴露方法

通过 `ref` 获取组件实例调用：

```ts
const tableRef = ref<InstanceType<typeof TableEntity>>();

tableRef.value?.clearSelection(); // 清空选择
tableRef.value?.getSelectedRows(); // 获取已选行数据
tableRef.value?.getSelectedCount(); // 获取已选数量
tableRef.value?.setSelectedKeys(keys); // 设置已选 keys
tableRef.value?.reload(); // 重新加载数据
```

## 树形模式

```vue
<TableEntity
  tree
  row-key="menuId"
  :data="treeData"
  :columns="columns"
  :default-expanded-row-keys="['1']"
/>
```

数据需包含 `children` 字段（可通过 `treeChildrenKey` 自定义）。设置 `rowDraggable` 后可拖动节点；仅能在同一父节点的同级范围内调整顺序，拖动不会改变节点层级。`row-sort` 事件返回新的完整树，可赋回数据源。
