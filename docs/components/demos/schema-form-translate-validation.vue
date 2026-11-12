<script setup lang="ts">
import { ref } from 'vue';
import { ElButton, ElMessage } from 'element-plus';

import { SchemaForm } from 'disguise-ui';
import type { SchemaFormItem } from 'disguise-ui';

const formRef = ref<InstanceType<typeof SchemaForm>>();
const values = ref({
  title: { de: '', en: 'Title', zh_cn: '' },
  description: { de: 'Kurz', en: 'Description', zh_cn: '描述至少六个字' },
});
const language = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'zh_cn', label: '简体中文' },
];
const schema: SchemaFormItem[] = [
  {
    prop: 'title',
    label: '多语言标题',
    type: 'text',
    required: true,
    translateConfig: { language },
  },
  {
    prop: 'description',
    label: '多语言描述',
    type: 'textarea',
    translateConfig: { language },
    rules: [
      {
        validator: (_rule, value) =>
          !value ||
          String(value).length >= 6 ||
          new Error('描述至少填写 6 个字符'),
      },
    ],
  },
];

async function submit() {
  if (await formRef.value?.validate()) ElMessage.success('所有语言校验通过');
}
</script>

<template>
  <SchemaForm ref="formRef" v-model="values" :schema="schema" />
  <ElButton type="primary" @click="submit">校验多语言</ElButton>
  <ElButton @click="formRef?.clearValidate()">清除校验</ElButton>
  <ElButton @click="formRef?.resetFields()">重置</ElButton>
</template>
