<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

import { SearchForm } from 'disguise-ui';
import type { SchemaFormItem } from 'disguise-ui';

const values = ref<Record<string, any>>({});

const schema: SchemaFormItem[] = [
  { prop: 'name', label: '名称', type: 'text' },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    optionSource: 'dict',
    dictCode: 'sys_status',
  },
  {
    prop: 'job',
    label: '岗位',
    type: 'select',
    optionSource: 'dict',
    dictCode: 'sys_job',
  },
  { prop: 'dept', label: '部门', type: 'text' },
  { prop: 'startDate', label: '开始日期', type: 'date' },
  { prop: 'endDate', label: '结束日期', type: 'date' },
];
</script>

<template>
  <SearchForm
    v-model="values"
    :schema="schema"
    :columns="3"
    :collapsed-rows="1"
    @search="ElMessage.success(`查询：${JSON.stringify($event)}`)"
    @reset="ElMessage.info('已重置')"
  />
</template>
