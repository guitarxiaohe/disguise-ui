<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus';
import { ref } from 'vue';

import { DialogList } from 'disguise-ui';
import type { DialogListColumn } from 'disguise-ui';

const visible = ref(false);
const selected = ref<number[]>([]);
const rows = Array.from({ length: 36 }, (_, index) => ({
  id: index + 1,
  name: `示例成员 ${index + 1}`,
  department: ['研发部', '产品部', '设计部'][index % 3],
}));
const columns: DialogListColumn[] = [
  {
    title: '姓名',
    dataKey: 'name',
    key: 'name',
    width: 180,
    search: { type: 'text', placeholder: '请输入姓名' },
  },
  {
    title: '部门',
    dataKey: 'department',
    key: 'department',
    width: 160,
    search: {
      type: 'select',
      options: [
        { label: '研发部', value: '研发部' },
        { label: '产品部', value: '产品部' },
        { label: '设计部', value: '设计部' },
      ],
    },
  },
];

async function fetcher({ page, per_page, params }: any) {
  const filtered = rows.filter((item) => {
    const name = params?.name;
    const department = params?.department;
    if (name && !item.name.includes(name)) return false;
    if (department && item.department !== department) return false;
    return true;
  });
  const start = (page - 1) * per_page;
  return {
    items: filtered.slice(start, start + per_page),
    total: filtered.length,
  };
}
</script>

<template>
  <ElButton type="primary" @click="visible = true">选择成员</ElButton>
  <span style="margin-left: 12px"
    >已选 ID：{{ selected.join(', ') || '无' }}</span
  >
  <DialogList
    v-model:visible="visible"
    v-model="selected"
    dialog-title="选择成员"
    :fetcher="fetcher"
    :columns="columns"
    :per-page="8"
    @confirm="ElMessage.success(`已选择 ${$event.length} 条当前页记录`)"
  />
</template>
