<script setup lang="ts">
import { ElTag } from 'element-plus';

import { TableEntity } from 'disguise-ui';
import type { ColumnsItem } from 'disguise-ui';

import { mockUsers } from '../../.vitepress/mock';

const columns: ColumnsItem[] = [
  { title: 'ID', dataKey: 'id', key: 'id', width: 80 },
  { title: '名称', dataKey: 'name', key: 'name', width: 140 },
  { title: '状态', dataKey: 'status', key: 'status', width: 120 },
];
</script>

<template>
  <TableEntity
    :data="mockUsers"
    :columns="columns"
    :height="320"
    :per_page="5"
    :show-actions="false"
  >
    <!-- 插槽名 = dataKey + Col，优先于默认文本渲染 -->
    <template #statusCol="{ value }">
      <ElTag :type="value === '1' ? 'success' : 'danger'">
        {{ value === '1' ? '启用' : '停用' }}
      </ElTag>
    </template>
  </TableEntity>
</template>
