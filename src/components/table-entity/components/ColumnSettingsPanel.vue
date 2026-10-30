<script setup lang="ts">
import type {
  ColumnFixedItem,
  ColumnFixedValue,
} from '../composables/use-column-fixed';
import type {
  ColumnAlignValue,
  ColumnSettingItem,
} from '../composables/use-column-settings';

import { computed, ref, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';

import { Menu } from '@element-plus/icons-vue';
import {
  ElButton,
  ElIcon,
  ElInputNumber,
  ElOption,
  ElSelect,
  ElSwitch,
} from 'element-plus';

import { $t as t } from '@/runtime/i18n';

const props = defineProps<{
  settings: ColumnSettingItem[];
  fixedItems: ColumnFixedItem[];
}>();

const emit = defineEmits<{
  'update:settings': [settings: ColumnSettingItem[]];
  toggle: [key: string];
  setHeaderAlign: [key: string, value: ColumnAlignValue];
  setContentAlign: [key: string, value: ColumnAlignValue];
  setWidth: [key: string, value: number];
  setFixed: [key: string, value: ColumnFixedValue];
  reset: [];
}>();

/** 本地设置副本，拖拽时直接修改 */
const localSettings = ref<ColumnSettingItem[]>([...props.settings]);

watch(
  () => props.settings,
  (val) => {
    // 外部 prop 变化时同步（仅在非拖拽中更新）
    localSettings.value = val.map((s) => ({ ...s }));
  },
  { deep: true },
);

const visibleCount = computed(
  () => localSettings.value.filter((s) => s.visible).length,
);

/** 拖拽排序完成后通知父组件 */
function handleUpdate() {
  emit(
    'update:settings',
    localSettings.value.map((s) => ({ ...s })),
  );
}

/** 切换某列可见性 */
function handleToggle(key: string) {
  emit('toggle', key);
}

/** 恢复默认 */
function handleReset() {
  emit('reset');
}

function fixedValue(key: string): ColumnFixedValue {
  return props.fixedItems.find((item) => item.key === key)?.fixed ?? false;
}
</script>

<template>
  <div class="column-settings-panel">
    <div class="column-settings-panel__header">
      <span class="column-settings-panel__title">{{
        t('components.tableEntity.columnSettings')
      }}</span>
      <ElButton type="primary" link size="small" @click="handleReset">
        {{ t('components.tableEntity.restoreDefault') }}
      </ElButton>
    </div>

    <div class="column-settings-panel__list">
      <div class="column-settings-panel__head">
        <span></span><span>{{ t('components.tableEntity.display') }}</span><span>{{ t('components.tableEntity.columnName') }}</span><span>{{ t('components.tableEntity.width') }}</span><span>{{ t('components.tableEntity.headerAlign') }}</span><span>{{ t('components.tableEntity.contentAlign') }}</span><span>{{ t('components.tableEntity.fixedColumn') }}</span>
      </div>
      <VueDraggable
        v-model="localSettings"
        :animation="200"
        handle=".column-settings-panel__drag-handle"
        ghost-class="column-settings-panel__ghost"
        @update="handleUpdate"
      >
        <div
          v-for="setting in localSettings"
          :key="setting.key"
          class="column-settings-panel__item"
          :class="{
            'column-settings-panel__item--hidden': !setting.visible,
          }"
        >
          <span class="column-settings-panel__drag-handle">
            <ElIcon><Menu /></ElIcon>
          </span>

          <ElSwitch
            :model-value="setting.visible"
            size="small"
            class="column-settings-panel__checkbox"
            @change="handleToggle(setting.key)"
          />

          <span class="column-settings-panel__label">{{ setting.title }}</span>

          <ElInputNumber
            :model-value="setting.column.width ?? 120"
            :min="50"
            :controls="false"
            size="small"
            class="column-settings-panel__width"
            @change="
              (value) => emit('setWidth', setting.key, Number(value) || 120)
            "
          />

          <ElSelect
            :model-value="setting.headerAlign"
            size="small"
            class="column-settings-panel__select"
            @change="
              (value) =>
                emit('setHeaderAlign', setting.key, value as ColumnAlignValue)
            "
          >
            <ElOption
              :label="t('components.tableEntity.left')"
              value="left"
            /><ElOption
              :label="t('components.tableEntity.center')"
              value="center"
            /><ElOption
              :label="t('components.tableEntity.right')"
              value="right"
            />
          </ElSelect>

          <ElSelect
            :model-value="setting.contentAlign"
            size="small"
            class="column-settings-panel__select"
            @change="
              (value) =>
                emit('setContentAlign', setting.key, value as ColumnAlignValue)
            "
          >
            <ElOption
              :label="t('components.tableEntity.left')"
              value="left"
            /><ElOption
              :label="t('components.tableEntity.center')"
              value="center"
            /><ElOption
              :label="t('components.tableEntity.right')"
              value="right"
            />
          </ElSelect>

          <ElSelect
            :model-value="fixedValue(setting.key)"
            size="small"
            class="column-settings-panel__select"
            @change="
              (value) =>
                emit(
                  'setFixed',
                  setting.key,
                  (value ?? false) as ColumnFixedValue,
                )
            "
          >
            <ElOption
              :label="t('components.tableEntity.unfixed')"
              :value="false"
            /><ElOption
              :label="t('components.tableEntity.leftFixed')"
              value="left"
            /><ElOption
              :label="t('components.tableEntity.rightFixed')"
              value="right"
            />
          </ElSelect>
        </div>
      </VueDraggable>
    </div>

    <div class="column-settings-panel__footer">
      <span class="column-settings-panel__count">
        {{
          t('components.tableEntity.visibleCount', {
            visible: visibleCount,
            total: localSettings.length,
          })
        }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.column-settings-panel {
  width: 100%;
  font-size: 13px;
  user-select: none;
}

.column-settings-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.column-settings-panel__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.column-settings-panel__list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}

.column-settings-panel__head,
.column-settings-panel__item {
  display: grid;
  grid-template-columns: 16px 40px minmax(72px, 1fr) 80px 92px 92px 100px;
  gap: 8px;
  align-items: center;
  padding: 0 12px;
}

.column-settings-panel__head {
  position: sticky;
  top: 0;
  z-index: 1;
  height: 36px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  background: #f8fafc;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.column-settings-panel__item {
  height: 44px;
  cursor: default;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  transition: background-color 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--el-fill-color-light);
  }

  &--hidden {
    .column-settings-panel__label {
      color: var(--el-text-color-placeholder);
    }
  }
}

.column-settings-panel__drag-handle {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: var(--el-text-color-placeholder);
  cursor: grab;
  transition: color 0.15s;

  &:hover {
    color: var(--el-text-color-secondary);
  }

  &:active {
    cursor: grabbing;
  }
}

.column-settings-panel__checkbox {
  flex-shrink: 0;
}

.column-settings-panel__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  transition: color 0.15s;
}

.column-settings-panel__width,
.column-settings-panel__select {
  width: 100%;
}

.column-settings-panel__width :deep(.el-input__inner) {
  text-align: left;
}

.column-settings-panel__radio-group {
  flex-shrink: 0;
}

.column-settings-panel__ghost {
  background: var(--el-color-primary-light-9);
  opacity: 0.4;
}

.column-settings-panel__footer {
  padding-top: 12px;
}

.column-settings-panel__count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
