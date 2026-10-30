<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus';

import { useDrawerFormPage } from 'disguise-ui';
import type { SchemaFormItem } from 'disguise-ui';

const schema: SchemaFormItem[] = [
  {
    prop: 'type',
    label: '类型',
    type: 'radio',
    defaultValue: 'normal',
    options: [
      { label: '普通', value: 'normal' },
      { label: '外链', value: 'link' },
    ],
  },
  {
    prop: 'name',
    label: '名称',
    type: 'text',
    required: true,
  },
  {
    prop: 'url',
    label: '链接地址',
    type: 'text',
    hidden: ({ values }) => values.type !== 'link',
    required: ({ values }) => values.type === 'link',
    props: ({ values, updateValue }) => ({
      maxlength: values.type === 'link' ? 500 : 100,
      onBlur: () => updateValue(String(values.url ?? '').trim()),
    }),
  },
  {
    prop: 'target',
    label: '打开方式',
    type: 'select',
    defaultValue: null,
    options: ({ values }) =>
      values.type === 'link'
        ? [
            { label: '当前窗口', value: '_self' },
            { label: '新窗口', value: '_blank' },
          ]
        : [],
    hidden: ({ values }) => values.type !== 'link',
  },
];

const [Drawer, api] = useDrawerFormPage({
  title: '字段联动',
  schema,
  onSubmit: (values) => {
    ElMessage.success(JSON.stringify(values));
  },
});
</script>

<template>
  <ElButton type="primary" @click="api.open()">打开联动示例</ElButton>
  <Drawer />
</template>
