<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus';
import { ref } from 'vue';

import { DialogList } from 'disguise-ui';
import type { ColumnsItem } from 'disguise-ui';

const visible = ref(false);
const selected = ref<number[]>([]);
const rows = Array.from({ length: 36 }, (_, index) => ({
  id: index + 1,
  name: `示例成员 ${index + 1}`,
  department: ['研发部', '产品部', '设计部'][index % 3],
}));
const columns: ColumnsItem[] = [
  { title: '姓名', dataKey: 'name', key: 'name', width: 180 },
  { title: '部门', dataKey: 'department', key: 'department', width: 160 },
];

async function fetcher({ page, per_page, keyword }: any) {
  const filtered = rows.filter(
    (item) => !keyword || item.name.includes(keyword),
  );
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
