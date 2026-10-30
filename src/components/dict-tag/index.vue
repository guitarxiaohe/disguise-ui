<script setup lang="ts">
import type { CSSProperties } from 'vue';

import { computed } from 'vue';

import { findDictValue, useDictData } from '@/composables/use-dict-data';

const props = withDefaults(
  defineProps<{
    /** 字典编码 */
    code?: string;
    /** 同 code，兼容旧调用 */
    dictType?: string;
    value?: null | number | string;
    label?: null | number | string;
    color?: null | string;
  }>(),
  {
    code: '',
    dictType: '',
    value: null,
    label: null,
    color: null,
  },
);

/** ****************************** 字典标签着色组件 ********************************/

const SEMANTIC_COLOR_CLASS: Record<string, string> = {
  blue: 'dict-tag--primary',
  danger: 'dict-tag--danger',
  gray: 'dict-tag--info',
  green: 'dict-tag--success',
  grey: 'dict-tag--info',
  info: 'dict-tag--info',
  orange: 'dict-tag--warning',
  primary: 'dict-tag--primary',
  red: 'dict-tag--danger',
  success: 'dict-tag--success',
  warning: 'dict-tag--warning',
  yellow: 'dict-tag--warning',
};

const dictCode = computed(() => props.code || props.dictType);
const { items } = useDictData(dictCode);

const matchedItem = computed(() => findDictValue(items.value, props.value));
const label = computed(
  () =>
    props.label ??
    matchedItem.value?.name ??
    matchedItem.value?.dictLabel ??
    (props.value === null || props.value === undefined || props.value === ''
      ? '--'
      : String(props.value)),
);
const color = computed(() => {
  const value =
    props.color ?? matchedItem.value?.color ?? matchedItem.value?.cssClass;
  return typeof value === 'string' && value ? value : undefined;
});
const tagClass = computed(() => {
  if (!color.value) return '';
  return SEMANTIC_COLOR_CLASS[color.value] ?? 'dict-tag--colored';
});
const customStyle = computed<CSSProperties>(() =>
  color.value && !SEMANTIC_COLOR_CLASS[color.value]
    ? ({ '--dict-tag-color': color.value } as CSSProperties)
    : {},
);
</script>

<template>
  <span class="dict-tag" :class="tagClass" :style="customStyle">
    {{ label }}
  </span>
</template>

<style scoped lang="scss">
.dict-tag {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  vertical-align: middle;
  color: #fff;
  white-space: nowrap;
  background: var(--color-primary-bg);
  border: 1px solid var(--color-primary-bg);
  border-radius: 4px;
}

.dict-tag--colored {
  color: var(--dict-tag-color);
  background: color-mix(in srgb, var(--dict-tag-color) 14%, transparent);
  border-color: color-mix(in srgb, var(--dict-tag-color) 42%, transparent);
}

.dict-tag--primary {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-8);
}

.dict-tag--success {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-8);
}

.dict-tag--danger {
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger-light-8);
}

.dict-tag--warning {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
  border-color: var(--el-color-warning-light-8);
}

.dict-tag--info {
  color: var(--el-color-info);
  background: var(--el-color-info-light-9);
  border-color: var(--el-color-info-light-8);
}
</style>
