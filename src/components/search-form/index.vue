<script setup lang="ts">
import type { FieldContext, SchemaFormMode } from '../schema-form';
import type {
  ResolvedEntry,
  ResolvedGroup,
} from '../schema-form/schema-form.type';
import type { SearchFormItem, SearchFormValues } from './index.type';

import { computed, ref, useSlots, watch } from 'vue';

import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import { ElButton } from 'element-plus';

import {
  flattenFields,
  isFieldHidden,
  isGroup,
} from '../schema-form/schema-form.util';
import SchemaForm from '../schema-form/schema-form.vue';

const props = withDefaults(
  defineProps<{
    collapsedRows?: number;
    columns?: number;
    disabled?: boolean;
    labelAlign?: 'center' | 'left' | 'right';
    labelPosition?: 'left' | 'right' | 'top';
    labelWidth?: number | string;
    mode?: SchemaFormMode;
    schema?: SearchFormItem[];
    showActions?: boolean;
  }>(),
  {
    collapsedRows: 2,
    columns: 4,
    disabled: false,
    labelAlign: 'left',
    labelPosition: 'left',
    labelWidth: 'auto',
    mode: 'create',
    schema: () => [],
    showActions: true,
  },
);

const emit = defineEmits<{
  reset: [values: SearchFormValues];
  search: [values: SearchFormValues];
}>();

const model = defineModel<SearchFormValues>({ default: () => ({}) });
const slots = useSlots();
const expanded = ref(false);
const schemaFormRef = ref<InstanceType<typeof SchemaForm>>();

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
const maxCollapsedItems = computed(() =>
  Math.max(props.columns * props.collapsedRows, props.columns),
);
const shouldCollapse = computed(
  () =>
    props.showActions && visibleEntries.value.length > maxCollapsedItems.value,
);
const displaySchema = computed<SearchFormItem[]>(() => {
  const schema =
    !shouldCollapse.value || expanded.value
      ? visibleEntries.value
      : visibleEntries.value.slice(0, maxCollapsedItems.value);
  return schema as SearchFormItem[];
});
const slotNames = computed(() => Object.keys(slots));

function visibleChildren(group: ResolvedGroup) {
  return group.children.filter((child) => !isFieldHidden(child, context.value));
}

function allFields() {
  return flattenFields(entries.value);
}

function getDefaultValues() {
  return Object.fromEntries(
    allFields().map((field) => [field.prop, field.defaultValue]),
  );
}

function getValues() {
  return { ...(model.value ?? {}) };
}

function handleSubmit() {
  emit('search', getValues());
}

function handleReset() {
  model.value = getDefaultValues();
  emit('reset', getValues());
}

async function validate() {
  return (await schemaFormRef.value?.validate()) ?? false;
}

watch(shouldCollapse, (collapsible) => {
  if (!collapsible) expanded.value = false;
});

defineExpose({
  getValues,
  validate,
  reset: handleReset,
  search: handleSubmit,
});
</script>

<template>
  <form class="search-form" @submit.prevent="handleSubmit">
    <SchemaForm
      ref="schemaFormRef"
      v-model="model"
      class="search-form__schema"
      :columns="columns"
      :disabled="disabled"
      :schema="displaySchema"
      :mode="mode"
      label-align="left"
      label-position="left"
      :label-width="labelWidth"
      :item-gap="12"
    >
      <template
        v-for="slotName in slotNames"
        :key="slotName"
        #[slotName]="slotProps"
      >
        <slot :name="slotName" v-bind="slotProps"></slot>
      </template>
    </SchemaForm>

    <div v-if="showActions" class="search-form__actions">
      <ElButton type="primary" native-type="submit">搜索</ElButton>
      <ElButton native-type="button" @click="handleReset">重置</ElButton>
      <ElButton
        v-if="shouldCollapse"
        link
        type="primary"
        native-type="button"
        :icon="expanded ? ArrowUp : ArrowDown"
        @click="expanded = !expanded"
      >
        {{ expanded ? '收起' : '展开' }}
      </ElButton>
    </div>
  </form>
</template>

<style scoped lang="scss">
.search-form {
  width: 100%;
}

.search-form__actions {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

:deep(.el-form-item) {
  margin-bottom: 12px;
}

:deep(.el-input),
:deep(.el-select),
:deep(.el-input-number),
:deep(.el-date-editor) {
  width: 100%;
}
</style>
