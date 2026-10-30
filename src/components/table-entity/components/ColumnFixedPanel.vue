<script setup lang="ts">
import type {
  ColumnFixedItem,
  ColumnFixedValue,
} from '../composables/use-column-fixed';

import { ElButton, ElRadioButton, ElRadioGroup } from 'element-plus';

import { $t as t } from '@/runtime/i18n';

defineProps<{
  items: ColumnFixedItem[];
}>();

defineEmits<{
  setFixed: [key: string, value: ColumnFixedValue];
  reset: [];
}>();
</script>

<template>
  <div class="column-fixed-panel">
    <div class="column-fixed-panel__header">
      <span class="column-fixed-panel__title">{{
        t('tableEntity.freezeColumn')
      }}</span>
      <ElButton type="primary" link size="small" @click="$emit('reset')">
        {{ t('tableEntity.restoreDefault') }}
      </ElButton>
    </div>

    <div class="column-fixed-panel__list">
      <div
        v-for="item in items"
        :key="item.key"
        class="column-fixed-panel__item"
      >
        <span class="column-fixed-panel__label">{{ item.title }}</span>
        <ElRadioGroup
          :model-value="item.fixed"
          size="small"
          class="column-fixed-panel__radio-group"
          @change="
            (val) =>
              $emit('setFixed', item.key, (val ?? false) as ColumnFixedValue)
          "
        >
          <ElRadioButton value="left">
            {{ t('tableEntity.left') }}
          </ElRadioButton>
          <ElRadioButton :value="false">
            {{ t('tableEntity.none') }}
          </ElRadioButton>
          <ElRadioButton value="right">
            {{ t('tableEntity.right') }}
          </ElRadioButton>
        </ElRadioGroup>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.column-fixed-panel {
  min-width: 260px;
  user-select: none;
}

.column-fixed-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.column-fixed-panel__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.column-fixed-panel__list {
  max-height: 360px;
  overflow-y: auto;
}

.column-fixed-panel__item {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px;
  border-radius: 4px;

  &:hover {
    background: var(--el-fill-color-light);
  }
}

.column-fixed-panel__label {
  flex: 0 0 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.column-fixed-panel__radio-group {
  flex-shrink: 0;
}
</style>
