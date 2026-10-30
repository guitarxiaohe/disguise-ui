<script setup lang="ts">
import { computed } from 'vue';

import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';

import { $t as t } from '@/runtime/i18n';

const props = withDefaults(
  defineProps<{
    expanded?: boolean;
    items: string[];
    /** 折叠时最多展示的条数 */
    max?: number;
    /** 「查看全部 N 个{unit}」中的单位 */
    unit?: string;
  }>(),
  {
    expanded: false,
    max: 2,
    unit: '',
  },
);

const emit = defineEmits<{
  toggle: [];
}>();

const limit = computed(() => Math.max(1, props.max));
const collapsible = computed(() => props.items.length > limit.value);
const visibleItems = computed(() =>
  props.expanded || !collapsible.value
    ? props.items
    : props.items.slice(0, limit.value),
);
const unitText = computed(
  () => props.unit || t('components.tableEntity.itemUnit'),
);

function onToggle(event: MouseEvent) {
  event.stopPropagation();
  emit('toggle');
}
</script>

<template>
  <div v-if="items.length > 0" class="list-expand-cell">
    <div
      v-for="(item, index) in visibleItems"
      :key="`${index}-${item}`"
      class="list-expand-cell__item"
    >
      {{ index + 1 }}. {{ item }}
    </div>
    <button
      v-if="collapsible"
      class="list-expand-cell__toggle"
      type="button"
      @click="onToggle"
    >
      <span>
        {{
          expanded
            ? t('components.tableEntity.collapseItems')
            : t('components.tableEntity.viewAllItems', {
                count: items.length,
                unit: unitText,
              })
        }}
      </span>
      <ElIcon class="list-expand-cell__icon">
        <ArrowUp v-if="expanded" />
        <ArrowDown v-else />
      </ElIcon>
    </button>
  </div>
  <span v-else>-</span>
</template>

<style scoped lang="scss">
.list-expand-cell__item {
  line-height: 22px;
  color: var(--el-text-color-primary);
  word-break: break-word;
  white-space: normal;
  cursor: pointer;
  transition: color 0.15s;
}

.list-expand-cell__item:hover {
  color: var(--el-color-primary);
  text-decoration: underline;
}

.list-expand-cell__toggle {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 0;
  margin-top: 2px;
  font-size: 14px;
  line-height: 22px;
  color: var(--el-color-primary);
  cursor: pointer;
  background: transparent;
  border: 0;
}

.list-expand-cell__icon {
  font-size: 12px;
}
</style>
