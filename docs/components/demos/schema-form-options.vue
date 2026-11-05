<script setup lang="ts">
import { ref } from 'vue';

import { SchemaForm } from 'disguise-ui';
import type { SchemaFormItem } from 'disguise-ui';

const values = ref<Record<string, any>>({});

const schema: SchemaFormItem[] = [
  {
    prop: 'status',
    label: '状态',
    type: 'radio',
    optionSource: 'static',
    options: [
      { label: '启用', value: '1' },
      { label: '停用', value: '0' },
    ],
  },
  {
    prop: 'sex',
    label: '性别',
    type: 'select',
    optionSource: 'dict',
    dictCode: 'sys_user_sex',
  },
  {
    prop: 'deptId',
    label: '部门',
    type: 'async-select',
    apiOptions: {
      entityKey: 'dept',
      subtitleKey: 'leader',
    },
  },
];
</script>

<template>
  <SchemaForm v-model="values" :schema="schema" :columns="2" />
</template>
