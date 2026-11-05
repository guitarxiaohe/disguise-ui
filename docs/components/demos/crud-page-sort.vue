<script setup lang="ts">
import { ref } from 'vue';

import { CrudPage } from 'disguise-ui';
import type { CrudPageField, TableEntityRowSortPayload } from 'disguise-ui';

const rows = ref([
  { id: 1, name: '首页 Banner', order: 1 },
  { id: 2, name: '新品推荐', order: 2 },
  { id: 3, name: '限时秒杀', order: 3 },
  { id: 4, name: '热销榜单', order: 4 },
  { id: 5, name: '底部导航', order: 5 },
]);

const fields: CrudPageField[] = [
  { prop: 'name', label: '名称', type: 'text', table: { width: 240 } },
  { prop: 'order', label: '排序值', type: 'number', table: { width: 140 } },
];

const lastSort = ref('拖动行左侧把手调整顺序');

function handleRowSort(payload: TableEntityRowSortPayload) {
  rows.value = payload.rows;
  lastSort.value = `${payload.oldIndex + 1} → ${payload.newIndex + 1}`;
}
</script>

<template>
  <CrudPage
    :fields="fields"
    :data="rows"
    :show-import="false"
    :table-props="{ rowDraggable: true, height: 320, showPagination: false }"
    @row-sort="handleRowSort"
  />
  <p style="margin-top: 8px; color: var(--el-text-color-secondary)">
    最近排序：{{ lastSort }}
  </p>
</template>
