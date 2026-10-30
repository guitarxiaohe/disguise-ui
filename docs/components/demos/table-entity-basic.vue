<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

import { TableEntity } from 'disguise-ui';
import type { ColumnsItem } from 'disguise-ui';

import { mockUsers } from '../../.vitepress/mock';

const columns: ColumnsItem[] = [
  { title: 'ID', dataKey: 'id', key: 'id', width: 80 },
  { title: '名称', dataKey: 'name', key: 'name', width: 140 },
  { title: '部门', dataKey: 'deptName', key: 'deptName', width: 140 },
  { title: '状态', dataKey: 'status', key: 'status', width: 100, type: 'dict', dictCode: 'sys_status' },
  { title: '创建时间', dataKey: 'createTime', key: 'createTime', width: 180, valueType: 'datetime' },
];

const data = ref(mockUsers);
</script>

<template>
  <TableEntity
    :data="data"
    :columns="columns"
    :height="320"
    :per_page="5"
    show-actions
    :actions="['view', 'edit', 'delete']"
    @handle-action="ElMessage.info(`${$event.action}：${$event.row.name}`)"
  />
</template>
