<script setup lang="ts">
import { computed } from 'vue';

import { CopyDocument } from '@element-plus/icons-vue';
import { useClipboard } from '@vueuse/core';
import { ElIcon, ElMessage } from 'element-plus';

import { $t as t } from '@/runtime/i18n';

const props = defineProps<{
  copyable?: boolean;
  value?: any;
}>();

const { copy, isSupported } = useClipboard();

const text = computed(() => {
  const value = props.value;
  if (value === null || value === undefined || value === '') return '';
  return Array.isArray(value) ? value.join(', ') : String(value);
});

const showCopy = computed(
  () => props.copyable && isSupported.value && text.value,
);

async function handleCopy() {
  await copy(text.value);
  ElMessage.success(t('schemaForm.copied'));
}
</script>

<template>
  <div class="readonly-text">
    <span v-if="text" class="readonly-text__value">{{ text }}</span>
    <span v-else class="readonly-text__empty">{{ t('schemaForm.empty') }}</span>
    <ElIcon
      v-if="showCopy"
      class="readonly-text__copy"
      :title="t('schemaForm.copy')"
      @click="handleCopy"
    >
      <CopyDocument />
    </ElIcon>
  </div>
</template>

<style scoped lang="scss">
.readonly-text {
  display: flex;
  gap: 6px;
  align-items: center;
  min-height: 32px;
  line-height: 32px;
}

.readonly-text__value {
  color: var(--el-text-color-primary);
  word-break: break-all;
}

.readonly-text__empty {
  color: var(--el-text-color-placeholder);
}

.readonly-text__copy {
  color: var(--el-text-color-secondary);
  cursor: pointer;

  &:hover {
    color: var(--el-color-primary);
  }
}
</style>
