<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus';

import { useDrawerFormPage } from 'disguise-ui';
import type { SchemaFormItem } from 'disguise-ui';

const schema: SchemaFormItem[] = [
  { prop: 'name', label: '名称', type: 'text', required: true },
  {
    prop: 'status',
    label: '状态',
    type: 'switch',
    defaultValue: true,
  },
  { prop: 'remark', label: '备注', type: 'textarea' },
];

const [Drawer, api] = useDrawerFormPage({
  title: '新增部门',
  schema,
  onSubmit: (values) => {
    ElMessage.success(`提交：${JSON.stringify(values)}`);
  },
});
</script>

<template>
  <ElButton type="primary" @click="api.open()">打开抽屉</ElButton>
  <Drawer />
</template>
