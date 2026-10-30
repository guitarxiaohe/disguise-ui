<script setup lang="ts">
import { ElButton, ElMessage, ElRate } from 'element-plus';

import { useDrawerFormPage } from 'disguise-ui';

import { drawerFormSample, drawerFormSchema } from './drawer-form-schema';

const [Drawer, api] = useDrawerFormPage({
  title: '商品资料',
  schema: drawerFormSchema,
  size: '820px',
  normalColumns: 2,
  fullscreenColumns: 3,
  submitText: '保存',
  onSubmit: (values) => {
    ElMessage.success(`已提交 ${values.name ?? ''}，共 ${Object.keys(values).length} 个字段`);
  },
});
</script>

<template>
  <ElButton type="primary" @click="api.open({ values: { ...drawerFormSample } })">
    打开全量抽屉
  </ElButton>
  <Drawer>
    <template #score="{ value, disabled, updateValue }">
      <ElRate
        :model-value="Number(value ?? 0)"
        :disabled="disabled"
        @update:model-value="updateValue"
      />
    </template>
    <template #footer="{ cancel, submit, submitting }">
      <div style="display: flex; justify-content: flex-end; gap: 12px">
        <ElButton :disabled="submitting" @click="cancel">取消</ElButton>
        <ElButton @click="ElMessage.info('已存草稿')">存草稿</ElButton>
        <ElButton type="primary" :loading="submitting" @click="submit">保存</ElButton>
      </div>
    </template>
  </Drawer>
</template>
