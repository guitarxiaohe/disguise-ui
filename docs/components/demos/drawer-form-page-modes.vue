<script setup lang="ts">
import { ElButton, ElMessage, ElRate } from 'element-plus';

import { useDrawerFormPage } from 'disguise-ui';

import { drawerFormSample, drawerFormSchema } from './drawer-form-schema';

const [Drawer, api] = useDrawerFormPage({
  schema: drawerFormSchema,
  size: '820px',
  normalColumns: 2,
  fullscreenColumns: 3,
  onSubmit: (values) => {
    ElMessage.success(`保存「${values.name ?? ''}」`);
  },
});
</script>

<template>
  <div style="display: flex; gap: 12px; flex-wrap: wrap">
    <ElButton
      type="primary"
      @click="api.open({ mode: 'create', title: '新增商品', values: {} })"
    >
      新增
    </ElButton>
    <ElButton
      @click="api.open({ mode: 'edit', title: '编辑商品', values: { ...drawerFormSample } })"
    >
      编辑
    </ElButton>
    <ElButton
      @click="api.open({ mode: 'view', title: '商品详情', values: { ...drawerFormSample } })"
    >
      查看
    </ElButton>
  </div>
  <Drawer>
    <template #score="{ value, disabled, updateValue }">
      <ElRate
        :model-value="Number(value ?? 0)"
        :disabled="disabled"
        @update:model-value="updateValue"
      />
    </template>
  </Drawer>
</template>
