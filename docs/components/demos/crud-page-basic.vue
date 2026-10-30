<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

import { CrudPage } from 'disguise-ui';
import type { CrudPageField, TableEntityDataFetcher } from 'disguise-ui';

import { mockUsers } from '../../.vitepress/mock';

const rows = ref(mockUsers.map((item) => ({ ...item })));
let nextId = rows.value.length + 1;

const fields: CrudPageField[] = [
  { prop: 'name', label: '名称', type: 'text', required: true, search: true, table: { width: 140 } },
  {
    prop: 'status',
    label: '状态',
    type: 'radio',
    defaultValue: '1',
    optionSource: 'dict',
    dictCode: 'sys_status',
    search: true,
    table: { width: 100, type: 'dict', dictCode: 'sys_status' },
  },
  {
    prop: 'job',
    label: '岗位',
    type: 'select',
    optionSource: 'dict',
    dictCode: 'sys_job',
    defaultValue: null,
    search: true,
    table: { width: 120, type: 'dict', dictCode: 'sys_job' },
  },
  {
    prop: 'deptId',
    label: '部门',
    type: 'async-select',
    apiOptions: { entityKey: 'dept' },
    defaultValue: null,
    table: { width: 140, dataKey: 'deptName' },
  },
  {
    prop: 'createTime',
    label: '创建时间',
    type: 'datetime',
    form: false,
    table: { width: 180 },
  },
];

const fetchList: TableEntityDataFetcher = async ({ current_page, per_page, query }) => {
  await new Promise((resolve) => setTimeout(resolve, 180));
  const keyword = String(query?.name ?? '').trim();
  const filtered = rows.value.filter((item) => {
    const matchName = !keyword || item.name.includes(keyword);
    const matchStatus = !query?.status || item.status === query.status;
    const matchJob = !query?.job || item.job === query.job;
    return matchName && matchStatus && matchJob;
  });
  const start = (current_page - 1) * per_page;
  return { rows: filtered.slice(start, start + per_page), total: filtered.length };
};

function handleCreate(values: Record<string, any>) {
  const deptName = { 1: '产品中心', 2: '研发部', 3: '设计部', 4: '运营部', 5: '财务部' }[values.deptId] ?? '';
  rows.value = [
    {
      ...values,
      id: nextId++,
      deptName,
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    },
    ...rows.value,
  ];
  ElMessage.success('已新增（示例数据仅存在于当前页面）');
}

function handleUpdate(values: Record<string, any>, row: Record<string, any>) {
  rows.value = rows.value.map((item) => (item.id === row.id ? { ...item, ...values } : item));
  ElMessage.success('已保存');
}

function handleDelete(row: Record<string, any>) {
  rows.value = rows.value.filter((item) => item.id !== row.id);
  ElMessage.success(`已删除 ${row.name}`);
}
</script>

<template>
  <CrudPage
    :fields="fields"
    :data="fetchList"
    :on-create="handleCreate"
    :on-update="handleUpdate"
    :on-delete="handleDelete"
    :show-import="false"
    :table-props="{ height: 360, per_page: 5 }"
  />
</template>
