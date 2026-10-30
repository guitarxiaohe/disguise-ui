<script setup lang="ts">
import { ref } from 'vue';

import { SchemaForm } from 'disguise-ui';
import type { SchemaFormItem } from 'disguise-ui';

const values = ref<Record<string, any>>({ type: 'normal' });

const schema: SchemaFormItem[] = [
  {
    prop: 'type',
    label: '类型',
    type: 'radio',
    options: [
      { label: '普通', value: 'normal' },
      { label: '外链', value: 'link' },
    ],
  },
  {
    prop: 'url',
    label: '链接地址',
    type: 'text',
    hidden: ({ values }) => values.type !== 'link',
    required: ({ values }) => values.type === 'link',
  },
  {
    prop: 'target',
    label: '打开方式',
    type: 'select',
    hidden: ({ values }) => values.type !== 'link',
    options: [
      { label: '当前窗口', value: '_self' },
      { label: '新窗口', value: '_blank' },
    ],
  },
];
</script>

<template>
  <SchemaForm v-model="values" :schema="schema" />
</template>
