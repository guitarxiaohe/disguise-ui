<script setup lang="ts">
import { ref } from 'vue';

import { SearchForm } from 'disguise-ui';
import type { SchemaFormItem, SearchFormValues } from 'disguise-ui';

const values = ref<SearchFormValues>({});
const lastSearch = ref('还没有触发过查询');

const schema: SchemaFormItem[] = [
  { prop: 'keyword', label: '关键词', type: 'text' },
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
];

function handleSearch(nextValues: SearchFormValues) {
  lastSearch.value = JSON.stringify(nextValues);
}
</script>

<template>
  <SearchForm
    v-model="values"
    :schema="schema"
    :columns="3"
    @search="handleSearch"
  />
  <p style="margin-top: 8px; color: var(--el-text-color-secondary)">
    最近一次查询：{{ lastSearch }}
  </p>
</template>
