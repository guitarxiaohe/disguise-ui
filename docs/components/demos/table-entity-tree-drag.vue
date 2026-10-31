<script setup lang="ts">
import { ref } from 'vue';

import { TableEntity } from 'disguise-ui';
import type { ColumnsItem, TableEntityRowSortPayload } from 'disguise-ui';

const treeData = ref<Record<string, any>[]>([
  {
    id: '1',
    name: '一级节点 A',
    order: 1,
    children: [
      { id: '1-1', name: '二级节点 A-1', order: 1 },
      { id: '1-2', name: '二级节点 A-2', order: 2 },
    ],
  },
  {
    id: '2',
    name: '一级节点 B',
    order: 2,
    children: [
      { id: '2-1', name: '二级节点 B-1', order: 1 },
      { id: '2-2', name: '二级节点 B-2', order: 2 },
    ],
  },
]);
const lastSort = ref('拖动把手调整同级节点顺序');

const columns: ColumnsItem[] = [
  { title: '节点名称', key: 'name', dataKey: 'name', width: 220 },
  { title: '排序值', key: 'order', dataKey: 'order', width: 100 },
];

function handleRowSort({
  rows,
  parentRowKey,
  oldIndex,
  newIndex,
}: TableEntityRowSortPayload) {
  treeData.value = rows;
  lastSort.value = `父节点 ${parentRowKey ?? '根级'}：${oldIndex} → ${newIndex}`;
}
</script>

<template>
  <div>
    <TableEntity
      tree
      row-draggable
      row-key="id"
      :data="treeData"
      :columns="columns"
      :height="320"
      :show-pagination="false"
      :default-expanded-row-keys="['1', '2']"
      @row-sort="handleRowSort"
    />
    <p style="margin-top: 8px; color: var(--el-text-color-secondary)">
      最近排序：{{ lastSort }}
    </p>
  </div>
</template>
