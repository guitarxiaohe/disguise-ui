<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus';
import { ref } from 'vue';

import { SchemaForm } from 'disguise-ui';
import type { SchemaFormItem } from 'disguise-ui';

const values = ref<Record<string, any>>({ job: null });
const formRef = ref<InstanceType<typeof SchemaForm>>();

const schema: SchemaFormItem[] = [
  { prop: 'name', label: '名称', type: 'text', required: true, span: 12 },
  {
    prop: 'job',
    label: '岗位',
    type: 'select',
    optionSource: 'dict',
    dictCode: 'sys_job',
    defaultValue: null,
    span: 12,
  },
  {
    prop: 'status',
    label: '状态',
    type: 'radio',
    defaultValue: '1',
    options: [
      { label: '启用', value: '1' },
      { label: '停用', value: '0' },
    ],
  },
  { prop: 'remark', label: '备注', type: 'textarea', tip: '选填，最多 200 字' },
];

async function submit() {
  const form = formRef.value;
  if (!form || !(await form.validate())) return;
  ElMessage.success(`提交：${JSON.stringify(form.getValues())}`);
}
</script>

<template>
  <SchemaForm ref="formRef" v-model="values" :schema="schema" :columns="2" />
  <ElButton type="primary" style="margin-top: 8px" @click="submit">提交</ElButton>
</template>
