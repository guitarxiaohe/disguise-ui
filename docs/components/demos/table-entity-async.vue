<script setup lang="ts">
import { TableEntity } from 'disguise-ui';
import type { ColumnsItem, TableEntityDataFetcher } from 'disguise-ui';

import { mockUsers } from '../../.vitepress/mock';

const columns: ColumnsItem[] = [
  { title: 'ID', dataKey: 'id', key: 'id', width: 80 },
  { title: '名称', dataKey: 'name', key: 'name', width: 140, sortable: true },
  { title: '部门', dataKey: 'deptName', key: 'deptName', width: 140 },
  {
    title: '创建时间',
    dataKey: 'createTime',
    key: 'createTime',
    width: 180,
    valueType: 'datetime',
  },
];

const fetchUsers: TableEntityDataFetcher = async ({
  current_page,
  per_page,
  sortField,
  sortOrder,
}) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const rows = [...mockUsers];
  if (sortField) {
    rows.sort((a, b) => {
      const result = String(a[sortField] ?? '').localeCompare(
        String(b[sortField] ?? ''),
      );
      return sortOrder === 'desc' ? -result : result;
    });
  }

  const start = (current_page - 1) * per_page;
  return {
    rows: rows.slice(start, start + per_page),
    total: rows.length,
  };
};
</script>

<template>
  <TableEntity
    :data="fetchUsers"
    :columns="columns"
    :height="320"
    :per_page="4"
  />
</template>
