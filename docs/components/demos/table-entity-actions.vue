<script setup lang="ts">
import { ElMessage } from 'element-plus';

import { TableEntity } from 'disguise-ui';
import type { ColumnsItem, TableEntityActionPayload } from 'disguise-ui';

import { mockUsers } from '../../.vitepress/mock';

const columns: ColumnsItem[] = [
  { title: 'ID', dataKey: 'id', key: 'id', width: 80 },
  { title: '名称', dataKey: 'name', key: 'name', width: 140 },
  { title: '部门', dataKey: 'deptName', key: 'deptName', width: 140 },
  {
    title: '状态',
    dataKey: 'status',
    key: 'status',
    width: 100,
    type: 'dict',
    dictCode: 'sys_status',
  },
];

const pushActions = [
  { name: 'approve', label: '审批', type: 'success' as const },
  { name: 'disable', label: '停用', type: 'warning' as const },
];

function handleAction({ action, row }: TableEntityActionPayload) {
  ElMessage.info(`${action}：${row.name}`);
}
</script>

<template>
  <TableEntity
    :data="mockUsers"
    :columns="columns"
    :height="320"
    :per_page="5"
    show-actions
    :actions="['view', 'edit', 'copy', 'delete']"
    :push-actions="pushActions"
    @handle-action="handleAction"
  />
</template>
