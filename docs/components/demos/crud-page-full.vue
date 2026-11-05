<script setup lang="ts">
import { ElMessage, ElRate } from 'element-plus';
import { ref } from 'vue';

import { CrudPage } from 'disguise-ui';
import type { TableEntityDataFetcher } from 'disguise-ui';

import { mockDepartments, mockUsers } from '../../.vitepress/mock';

import { crudFullFields } from './crud-page-schema';

const rows = ref(
  mockUsers.map((item, index) => ({
    ...item,
    sort: index + 1,
    enabled: item.status === '1',
    summary: `${item.name} 的简介`,
    region: ['zj', 'hz', 'xh'],
    channel: 'online',
    themeColor: '#409EFF',
    score: 4,
    onlineDate: '2026-01-01',
    publishAt: item.createTime,
    cover: '/logo.svg',
    manual: '/test.pdf',
    attachment: '/test.pdf',
    detail: `<p>${item.name} 的商品详情</p>`,
  })),
);
let nextId = rows.value.length + 1;

const fetchList: TableEntityDataFetcher = async ({
  current_page,
  per_page,
  query,
}) => {
  await new Promise((resolve) => setTimeout(resolve, 160));
  const keyword = String(query?.name ?? '').trim();
  const filtered = rows.value.filter((item) => {
    const matchName = !keyword || item.name.includes(keyword);
    const matchStatus = !query?.status || item.status === query.status;
    const matchJob = !query?.job || item.job === query.job;
    const matchDept = query?.deptId == null || item.deptId === query.deptId;
    return matchName && matchStatus && matchJob && matchDept;
  });
  const start = (current_page - 1) * per_page;
  return {
    rows: filtered.slice(start, start + per_page),
    total: filtered.length,
  };
};

function handleCreate(values: Record<string, any>) {
  const deptName =
    mockDepartments.find((item) => item.id === values.deptId)?.name ?? '';
  const id = nextId++;
  rows.value = [
    {
      ...values,
      id,
      userId: id,
      nickName: values.name,
      userName: values.userName ?? values.name,
      deptName,
      oldPrice: undefined,
      tags: values.tags ?? [],
      cover: values.cover ?? '/logo.svg',
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    },
    ...rows.value,
  ];
  ElMessage.success('已新增（示例数据仅存在于当前页面）');
}

function handleUpdate(values: Record<string, any>, row: Record<string, any>) {
  rows.value = rows.value.map((item) =>
    item.id === row.id ? { ...item, ...values } : item,
  );
  ElMessage.success('已保存');
}

function handleDelete(row: Record<string, any>) {
  rows.value = rows.value.filter((item) => item.id !== row.id);
  ElMessage.success(`已删除 ${row.name}`);
}
</script>

<template>
  <CrudPage
    :fields="crudFullFields"
    :data="fetchList"
    :on-create="handleCreate"
    :on-update="handleUpdate"
    :on-delete="handleDelete"
    :search-form-props="{ columns: 4, collapsedRows: 1 }"
    :drawer-props="{ size: '720px' }"
    :show-import="false"
    :table-props="{ height: 460, per_page: 6 }"
  >
    <template #score="{ value, disabled, updateValue }">
      <ElRate
        :model-value="Number(value ?? 0)"
        :disabled="disabled"
        @update:model-value="updateValue"
      />
    </template>
  </CrudPage>
</template>
