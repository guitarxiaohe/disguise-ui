<script setup lang="ts">
import type { FormInstance } from 'element-plus';

import type {
  FieldContext,
  ResolvedEntry,
  ResolvedField,
  ResolvedGroup,
  SchemaFormProps,
} from './schema-form.type';

import { computed, ref, watch } from 'vue';

import { ElCol, ElForm, ElFormItem, ElRow } from 'element-plus';

import SchemaFormItem from './schema-form-item.vue';
import {
  evalCondition,
  flattenFields,
  isFieldHidden,
  isGroup,
} from './schema-form.util';

const props = withDefaults(defineProps<SchemaFormProps>(), {
  columns: 1,
  disabled: false,
  groupGap: 0,
  itemGap: 30,
  labelAlign: undefined,
  labelGap: 20,
  labelPosition: 'top',
  labelWidth: 'auto',
  loading: false,
  mode: 'create',
  schema: () => [],
  underline: false,
});

const model = defineModel<Record<string, any>>({ default: () => ({}) });

const formRef = ref<FormInstance>();

const entries = computed(() => props.schema as ResolvedEntry[]);

const context = computed<FieldContext>(() => ({
  mode: props.mode,
  values: model.value ?? {},
}));

const visibleEntries = computed(() =>
  entries.value.filter((entry) => {
    if (isFieldHidden(entry, context.value)) return false;
    if (isGroup(entry)) return visibleChildren(entry).length > 0;
    return true;
  }),
);

function visibleChildren(group: ResolvedGroup) {
  return group.children.filter((child) => !isFieldHidden(child, context.value));
}

const visibleFields = computed(() =>
  visibleEntries.value.flatMap((entry) =>
    isGroup(entry) ? visibleChildren(entry) : [entry],
  ),
);

const defaultSpan = computed(() => Math.floor(24 / props.columns));

const formClass = computed(() => ({
  [`schema-form--label-align-${props.labelAlign}`]: !!props.labelAlign,
  'schema-form--underline': props.underline,
}));
const effectiveLabelPosition = computed(() =>
  props.mode === 'view' ? 'left' : props.labelPosition,
);

function toCssSize(value: number | string) {
  return typeof value === 'number' ? `${value}px` : value;
}

const formStyle = computed(() => ({
  '--schema-form-group-gap': toCssSize(props.groupGap),
  '--schema-form-item-gap': toCssSize(props.itemGap),
  '--schema-form-label-gap': toCssSize(props.labelGap),
}));

/** 分组容器没有 prop，用标签加下标兜底 key */
function entryKey(entry: ResolvedEntry, index: number) {
  return isGroup(entry) ? `group-${index}-${entry.label}` : entry.prop;
}

/** 组内子项按 span 作为 flex 权重横向分配，不写则等分 */
function childStyle(child: ResolvedField, alignToColumns = false) {
  if (alignToColumns) {
    return {
      gridColumn: child.newRow
        ? '1 / -1'
        : `span ${child.span ?? defaultSpan.value}`,
    };
  }
  return { flex: `${child.span ?? 1} 1 0` };
}

/** 子项的必填星号由容器标签统一呈现 */
function isGroupRequired(group: ResolvedGroup) {
  return visibleChildren(group).some((child) =>
    evalCondition(child.required, context.value),
  );
}

function anchorGroupNumber(group: ResolvedGroup) {
  const groups = visibleEntries.value.filter(
    (entry): entry is ResolvedGroup => isGroup(entry) && !!entry.anchor,
  );
  return String(groups.indexOf(group) + 1).padStart(2, '0');
}

function isDisabled(field: ResolvedField, group?: ResolvedGroup) {
  return (
    props.disabled ||
    evalCondition(group?.disabled, context.value) ||
    evalCondition(field.disabled, context.value)
  );
}

function isReadonly(field: ResolvedField) {
  return props.mode === 'view' || !!field.readonly;
}

function setValue(prop: string, value: any) {
  model.value = { ...model.value, [prop]: value };
}

// 仅在键缺失时补默认值，用户主动清空后的空值不会被重新填充
watch(
  [entries, model],
  () => {
    const values = model.value ?? {};
    const patch: Record<string, any> = {};
    for (const field of flattenFields(entries.value)) {
      if (field.defaultValue !== undefined && !(field.prop in values)) {
        patch[field.prop] = field.defaultValue;
      }
    }
    if (Object.keys(patch).length > 0) {
      model.value = { ...values, ...patch };
    }
  },
  { immediate: true },
);

async function validate() {
  if (!formRef.value) return false;
  try {
    await formRef.value.validate();
    return true;
  } catch {
    return false;
  }
}

defineExpose({
  validate,
  clearValidate: () => formRef.value?.clearValidate(),
  resetFields: () => formRef.value?.resetFields(),
  /** 提交用的值，已剔除当前隐藏的字段 */
  getValues: () =>
    Object.fromEntries(
      visibleFields.value.map((field) => [
        field.prop,
        model.value?.[field.prop],
      ]),
    ),
});
</script>

<template>
  <div class="schema-form-root">
    <ElForm
      ref="formRef"
      v-loading="loading"
      class="schema-form"
      :class="formClass"
      :style="formStyle"
      :model="model"
      :label-width="labelWidth"
      :label-position="effectiveLabelPosition"
    >
      <ElRow :gutter="16">
        <template
          v-for="(entry, index) in visibleEntries"
          :key="entryKey(entry, index)"
        >
          <div
            v-if="entry.newRow"
            class="schema-form__row-break"
            aria-hidden="true"
          ></div>

          <ElCol
            :span="entry.span ?? (entry.type === 'group' ? 24 : defaultSpan)"
            :class="{
              'schema-form-col--anchor-group':
                entry.type === 'group' && entry.anchor,
              'schema-form-col--group-divider':
                entry.type === 'group' && index > 0,
            }"
          >
            <ElFormItem
              v-if="entry.type === 'group'"
              class="schema-form-group"
              :class="{
                'schema-form-group--anchor': entry.anchor,
              }"
              :data-form-anchor="
                entry.anchor ? entries.indexOf(entry) : undefined
              "
              :label="entry.label"
            >
              <template #label>
                <div v-if="entry.anchor" class="schema-form-group__header">
                  <span class="schema-form-group__index">
                    {{ anchorGroupNumber(entry) }}
                  </span>
                  <span class="schema-form-group__heading">
                    <strong>{{ entry.label }}</strong>
                    <small v-if="entry.description">
                      {{ entry.description }}
                    </small>
                  </span>
                  <span
                    v-if="isGroupRequired(entry)"
                    class="schema-form-group__required-note"
                  >
                    为必填项
                  </span>
                </div>
                <span v-else>{{ entry.label }}</span>
              </template>
              <div
                class="schema-form-group__body"
                :class="{ 'schema-form-group__body--grid': entry.anchor }"
              >
                <SchemaFormItem
                  v-for="child in visibleChildren(entry)"
                  :key="child.prop"
                  :style="childStyle(child, entry.anchor)"
                  :hide-label="!entry.anchor"
                  :field="child"
                  :context="context"
                  :label-position="effectiveLabelPosition"
                  :model-value="model[child.prop]"
                  :disabled="isDisabled(child, entry)"
                  :readonly="isReadonly(child)"
                  @update:model-value="setValue(child.prop, $event)"
                >
                  <template #default="slotProps">
                    <slot :name="child.prop" v-bind="slotProps"></slot>
                  </template>
                </SchemaFormItem>
              </div>

              <div v-if="entry.tip" class="schema-form-group__tip">
                {{ entry.tip }}
              </div>
            </ElFormItem>

            <SchemaFormItem
              v-else
              :field="entry"
              :context="context"
              :label-position="effectiveLabelPosition"
              :model-value="model[entry.prop]"
              :disabled="isDisabled(entry)"
              :readonly="isReadonly(entry)"
              @update:model-value="setValue(entry.prop, $event)"
            >
              <template #default="slotProps">
                <slot :name="entry.prop" v-bind="slotProps"></slot>
              </template>
            </SchemaFormItem>
          </ElCol>
        </template>
      </ElRow>
    </ElForm>
  </div>
</template>

<style scoped lang="scss">
.schema-form :deep([data-form-anchor]) {
  scroll-margin-top: 58px;
}

.schema-form {
  width: 100%;

  /* EP 在 .el-form-item 上写死 18px，需在项上覆盖变量与 margin */
  :deep(.el-form-item) {
    --el-form-item-margin-bottom: var(--schema-form-item-gap);

    margin-bottom: var(--schema-form-item-gap);
  }

  :deep(.schema-form-group) {
    margin-top: var(--schema-form-group-gap);
    margin-bottom: calc(
      var(--schema-form-item-gap) + var(--schema-form-group-gap)
    );
  }

  &.schema-form--label-align-left :deep(.el-form-item__label) {
    justify-content: flex-start;
    text-align: left;
  }

  &.schema-form--label-align-center :deep(.el-form-item__label) {
    justify-content: center;
    text-align: center;
  }

  &.schema-form--label-align-right :deep(.el-form-item__label) {
    justify-content: flex-end;
    text-align: right;
  }

  &.el-form--label-left :deep(.el-form-item__label) {
    // padding-right: var(--schema-form-label-gap);
  }

  &.el-form--label-right :deep(.el-form-item__label) {
    padding-left: var(--schema-form-label-gap);
  }

  &.el-form--label-top :deep(.el-form-item__label) {
    // padding-bottom: var(--schema-form-label-gap);
  }

  // Element Plus 使用 box-shadow 绘制外框；仅在传入 underline 时改为底部边框。
  &.schema-form--underline {
    :deep(.el-input__wrapper),
    :deep(.el-textarea__inner),
    :deep(.el-select__wrapper) {
      border: 0;
      border-bottom: 1px solid #e5e7eb;
      border-radius: 0;
      box-shadow: none !important;

      &:hover {
        border-bottom-color: var(--el-border-color-hover);
      }

      &:focus,
      &.is-focus,
      &.is-focused {
        border-bottom-color: var(--el-color-primary);
      }
    }

    :deep(.el-input-group__append),
    :deep(.el-input-group__prepend) {
      border-bottom: 1px solid #e5e7eb;
      border-radius: 0;
      box-shadow: none;
    }

    :deep(.el-input-number__decrease),
    :deep(.el-input-number__increase) {
      border-right: 0;
      border-left: 0;
      border-radius: 0;
    }

    :deep(.is-error .el-input__wrapper),
    :deep(.is-error .el-textarea__inner),
    :deep(.is-error .el-select__wrapper) {
      border-bottom-color: var(--el-color-danger);
    }

    :deep(.el-input.is-disabled .el-input__wrapper),
    :deep(.el-textarea.is-disabled .el-textarea__inner),
    :deep(.el-select__wrapper.is-disabled),
    :deep(.el-range-editor.is-disabled) {
      border-bottom-color: var(--el-disabled-border-color);
    }
  }
}

/* ElRow 为 flex 布局，占满一行宽度即可强制换行 */
.schema-form__row-break {
  flex-basis: 100%;
  width: 0;
  height: 0;
  padding: 0;
  margin: 0;
}

.schema-form-col--group-divider {
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.schema-form-group__body {
  display: flex;
  gap: 8px;
  width: 100%;

  /* 子项的间距由容器统一控制，避免出现双倍行距 */
  :deep(.schema-form-item) {
    --el-form-item-margin-bottom: 0;

    min-width: 0;
    margin-bottom: 0;
  }
}

.schema-form-group__body--grid {
  display: grid;
  grid-template-columns: repeat(24, minmax(0, 1fr));
  gap: var(--schema-form-item-gap) 16px;
}

.schema-form-group__body--grid :deep(.schema-form-item) {
  min-width: 0;
}

.schema-form :deep(.schema-form-group--anchor) {
  display: block;
  margin-top: var(--schema-form-group-gap);
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  box-shadow:
    0 1px 2px rgb(31 35 41 / 3%),
    0 6px 20px rgb(31 35 41 / 3.5%);
}

.schema-form :deep(.schema-form-group--anchor > .el-form-item__label) {
  display: block;
  width: 100%;
  height: auto;
  padding: 0;
  margin: 0;
}

.schema-form :deep(.schema-form-group--anchor > .el-form-item__content) {
  display: block;
  width: 100%;
  padding: 22px;
  line-height: 1.5;
}

.schema-form-col--anchor-group.schema-form-col--group-divider {
  padding-top: 0;
  border-top: 0;
}

.schema-form-group__header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
  min-height: 66px;
  padding: 15px 22px 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.schema-form-group__index {
  display: grid;
  flex: 0 0 28px;
  place-items: center;
  width: 28px;
  height: 28px;
  margin-top: 1px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 6px;
}

.schema-form-group__heading {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.schema-form-group__heading strong {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: var(--el-text-color-primary);
}

.schema-form-group__heading small {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  color: var(--el-text-color-secondary);
}

.schema-form-group__required-note {
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 400;
  line-height: 24px;
  color: var(--el-text-color-secondary);
}

.schema-form-group__required-note::before {
  margin-right: 4px;
  color: var(--el-color-danger);
  content: '*';
}

.schema-form-group__tip {
  width: 100%;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}
</style>
