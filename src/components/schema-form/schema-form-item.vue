<script setup lang="ts">
import type { AttachmentData } from '@/components/file-upload/file-upload.type';

import type { FieldContext, ResolvedField } from './schema-form.type';

import { computed, defineAsyncComponent } from 'vue';

import { formatDate, formatDateTime } from '@/runtime/utils';

import DictTag from '@/components/dict-tag/index.vue';
import { getEntity } from '@/entities';
import {
  ElCheckbox,
  ElCheckboxGroup,
  ElDatePicker,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElRadio,
  ElRadioGroup,
  ElSwitch,
} from 'element-plus';

import FileCell from '../table-entity/cells/file-cell.vue';
import PictureCell from '../table-entity/cells/picture-cell.vue';
import ReadonlyText from './readonly-text.vue';
import { resolveSchemaFormComponent } from './schema-form-registry';
import { resolvePlaceholder, resolveRules } from './schema-form.util';
import TranslateField from './translate-field.vue';
import { useFieldOptions } from './use-field-options';

const props = defineProps<{
  disabled?: boolean;
  field: ResolvedField;
  context?: FieldContext;
  /** 分组内的子项由容器统一出标签 */
  hideLabel?: boolean;
  labelPosition?: 'left' | 'right' | 'top';
  modelValue?: any;
  readonly?: boolean;
}>();
const emit = defineEmits<{
  'update:modelValue': [value: any];
}>();
const AsyncSelect = defineAsyncComponent(
  () => import('@/components/async-select/async-select.vue'),
);
const FileUpload = defineAsyncComponent(
  () => import('@/components/file-upload'),
);
const PictureUpload = defineAsyncComponent(
  () => import('@/components/picture-upload'),
);
const RichTextEditor = defineAsyncComponent(
  () => import('@/components/rich-text-editor/index.vue'),
);
const context = computed(
  () => props.context ?? { mode: 'create' as const, values: {} },
);
const options = useFieldOptions(() => props.field, context);
const propsContext = computed(() => ({
  ...context.value,
  updateValue: update,
}));
const resolvedProps = computed(() => {
  if (typeof props.field.props !== 'function') {
    return props.field.props;
  }
  return props.field.props(propsContext.value);
});

const rules = computed(() => resolveRules(props.field, context.value));
const placeholder = computed(() => resolvePlaceholder(props.field));
const copyable = computed(() => props.field.copyable ?? !!props.field.readonly);
const isTranslatedField = computed(
  () =>
    !!props.field.translateConfig &&
    ['rich-text', 'text', 'textarea'].includes(props.field.type),
);

function normalizeOptionValue(value: unknown) {
  if (typeof value === 'boolean') return value ? '1' : '0';
  return value === null || value === undefined ? '' : String(value);
}

function getOptionLabel(value: unknown) {
  const normalizedValue = normalizeOptionValue(value);
  const option = options.value.find(
    (item) => normalizeOptionValue(item.value) === normalizedValue,
  );
  return option?.label ?? String(value ?? '');
}

const readonlyValue = computed(() => {
  const { type } = props.field;
  const value = props.modelValue;

  if (type === 'datetime') return formatDateTime(value);
  if (type === 'date') return formatDate(value);

  if (type === 'switch') {
    const activeValue = resolvedProps.value?.activeValue ?? true;
    const inactiveValue = resolvedProps.value?.inactiveValue ?? false;
    if (normalizeOptionValue(value) === normalizeOptionValue(activeValue)) {
      return resolvedProps.value?.activeText ?? '是';
    }
    if (normalizeOptionValue(value) === normalizeOptionValue(inactiveValue)) {
      return resolvedProps.value?.inactiveText ?? '否';
    }
  }

  if (
    type === 'select' ||
    type === 'async-select' ||
    type === 'radio' ||
    type === 'checkbox'
  ) {
    if (Array.isArray(value)) {
      return value.map((item) => getOptionLabel(item)).join('、');
    }
    if (value !== null && value !== undefined && value !== '') {
      return getOptionLabel(value);
    }
  }

  return value;
});
const readonlyDictValues = computed(() => {
  const values = (
    Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
  ).filter((value) => value !== null && value !== undefined && value !== '');
  return values.length > 0 ? values : [null];
});
const readonlyPictureUrls = computed(() => {
  const value = props.modelValue;
  if (value === null || value === undefined || value === '') return [];

  let values: any[];
  if (Array.isArray(value)) {
    values = value;
  } else if (typeof value === 'string') {
    values = value.split(',');
  } else {
    values = [value];
  }

  return values
    .map((item) =>
      item && typeof item === 'object' ? (item.fileUrl ?? item.url) : item,
    )
    .filter((url): url is string => typeof url === 'string' && !!url);
});
const readonlyAttachments = computed<AttachmentData[]>(() => {
  const value = props.modelValue;
  if (value === null || value === undefined || value === '') return [];

  let values: any[];
  if (Array.isArray(value)) {
    values = value;
  } else if (typeof value === 'string') {
    values = value.split(',');
  } else {
    values = [value];
  }

  return values
    .map((item): AttachmentData | null => {
      if (typeof item === 'string') {
        return { fileUrl: item, fileOriginName: item };
      }
      if (!item || typeof item !== 'object') return null;

      const attachment = item as AttachmentData;
      return {
        ...attachment,
        fileUrl: attachment.fileUrl ?? attachment.url,
        fileOriginName:
          attachment.fileOriginName ??
          attachment.name ??
          attachment.url ??
          attachment.fileUrl,
      };
    })
    .filter((item): item is AttachmentData => !!item);
});
const readonlyPreviewCount = computed(
  () =>
    resolvedProps.value?.maxPreviewCount ?? resolvedProps.value?.maxCount ?? 3,
);
const customComponent = computed(() =>
  resolveSchemaFormComponent(props.field.component),
);
const customComponentValueProps = computed(() => {
  const registration = customComponent.value;
  if (!registration) return {};

  return {
    ...resolvedProps.value,
    [registration.modelProp ?? 'modelValue']: props.modelValue,
    disabled: props.disabled,
  };
});
const customComponentListeners = computed(() => {
  const registration = customComponent.value;
  if (!registration) return {};

  const updateEvent =
    registration.updateEvent ??
    `update:${registration.modelProp ?? 'modelValue'}`;
  return {
    [updateEvent]: (value: any) =>
      update(registration.valueExtractor?.(value) ?? value),
  };
});

const richTextProps = computed(() => ({
  ...resolvedProps.value,
  editable: !props.disabled && resolvedProps.value?.editable !== false,
}));

/** async-select 需要的取数与展示配置来自实体注册表，字段可局部覆盖 */
const apiOptions = computed(() => props.field.apiOptions);
const entity = computed(() =>
  apiOptions.value ? getEntity(apiOptions.value.entityKey) : undefined,
);

const asyncSelectProps = computed(() => {
  const definition = entity.value;
  const api = apiOptions.value;
  if (!definition || !api) return null;
  return {
    columns: definition.columns ?? [],
    dialogTitle: definition.dialogTitle,
    labelKey: api.labelKey ?? definition.labelKey,
    multiple: api.multiple ?? false,
    subtitleKey: api.subtitleKey ?? definition.subtitleKey ?? '',
    valueKey: api.valueKey ?? definition.valueKey,
  };
});

function update(value: any) {
  emit('update:modelValue', value);
}

function fetchEntity(params: {
  keyword?: string;
  page: number;
  per_page: number;
}) {
  const definition = entity.value;
  if (!definition) return Promise.resolve({ items: [], total: 0 });
  return definition.fetch({ ...params, params: apiOptions.value?.params });
}

/** static / dict 选项在本地分页与搜索，供 AsyncSelect 使用 */
function fetchStaticOptions(params: {
  keyword?: string;
  page: number;
  per_page: number;
}) {
  let items = options.value.map((option) => ({
    label: option.label,
    value: option.value,
    ...(option.flag ? { flag: option.flag } : {}),
  }));
  const keyword = params.keyword?.trim();
  if (keyword) {
    const lower = keyword.toLowerCase();
    items = items.filter(
      (item) =>
        String(item.label).toLowerCase().includes(lower) ||
        String(item.value).toLowerCase().includes(lower),
    );
  }
  const start = (params.page - 1) * params.per_page;
  return Promise.resolve({
    items: items.slice(start, start + params.per_page),
    total: items.length,
  });
}
</script>

<template>
  <ElFormItem
    class="schema-form-item"
    :class="{ 'schema-form-item--bare': hideLabel }"
    :label="hideLabel ? undefined : field.label"
    :label-width="hideLabel ? '0' : undefined"
    :prop="field.prop"
    :rules="rules"
  >
    <TranslateField
      v-if="isTranslatedField"
      :config="field.translateConfig"
      :context="context"
      :disabled="disabled || readonly"
      :field="field"
      :label-position="labelPosition"
      :input-props="resolvedProps"
      :model-value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      @update:model-value="update"
    />

    <RichTextEditor
      v-else-if="readonly && field.type === 'rich-text'"
      :model-value="modelValue"
      :placeholder="placeholder"
      :editable="false"
      v-bind="resolvedProps"
    />

    <span
      v-else-if="readonly && field.optionSource === 'dict' && field.dictCode"
      class="schema-form-item__dict-tag"
    >
      <DictTag
        v-for="(value, index) in readonlyDictValues"
        :key="`${field.prop}-${index}`"
        :code="field.dictCode"
        :value="value"
      />
    </span>

    <PictureCell
      v-else-if="readonly && field.type === 'picture'"
      :urls="readonlyPictureUrls"
      :max-preview-count="readonlyPreviewCount"
    />

    <FileCell
      v-else-if="readonly && (field.type === 'file' || field.type === 'upload')"
      :attachments="readonlyAttachments"
      :max-preview-count="readonlyPreviewCount"
    />

    <ReadonlyText
      v-else-if="readonly"
      :value="readonlyValue"
      :copyable="copyable"
    />

    <component
      v-else-if="customComponent"
      :is="customComponent.component"
      v-bind="customComponentValueProps"
      v-on="customComponentListeners"
    />

    <!-- 上传字段的只读态由组件自身呈现，保留文件名、预览与下载 -->
    <FileUpload
      v-else-if="field.type === 'upload'"
      :model-value="modelValue"
      :placeholder="field.placeholder"
      :disabled="disabled || readonly"
      :show-remove="!readonly"
      v-bind="resolvedProps"
      @update:model-value="update"
    />

    <PictureUpload
      v-else-if="field.type === 'picture'"
      :model-value="modelValue"
      :disabled="disabled || readonly"
      :show-remove="!readonly"
      v-bind="resolvedProps"
      @update:model-value="update"
    />

    <FileUpload
      v-else-if="field.type === 'file'"
      :model-value="modelValue"
      :placeholder="field.placeholder"
      :disabled="disabled || readonly"
      :show-remove="!readonly"
      v-bind="resolvedProps"
      @update:model-value="update"
    />

    <slot
      v-else-if="field.type === 'slot'"
      :field="field"
      :value="modelValue"
      :disabled="disabled"
      :update-value="update"
    ></slot>

    <ElInput
      v-else-if="field.type === 'text'"
      :model-value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      clearable
      v-bind="resolvedProps"
      @update:model-value="update"
    />

    <ElInput
      v-else-if="field.type === 'textarea'"
      type="textarea"
      :rows="4"
      :model-value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      v-bind="resolvedProps"
      @update:model-value="update"
    />

    <RichTextEditor
      v-else-if="field.type === 'rich-text'"
      :model-value="modelValue"
      :placeholder="placeholder"
      v-bind="richTextProps"
      @update:model-value="update"
    />

    <ElInputNumber
      v-else-if="field.type === 'number'"
      :model-value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      v-bind="resolvedProps"
      @update:model-value="update"
    />

    <AsyncSelect
      v-else-if="field.type === 'select'"
      :model-value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :fetcher="fetchStaticOptions"
      label-key="label"
      value-key="value"
      v-bind="resolvedProps"
      @update:model-value="update"
    />

    <ElRadioGroup
      v-else-if="field.type === 'radio'"
      :model-value="modelValue"
      :disabled="disabled"
      v-bind="resolvedProps"
      @update:model-value="update"
    >
      <ElRadio
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </ElRadio>
    </ElRadioGroup>

    <ElCheckboxGroup
      v-else-if="field.type === 'checkbox'"
      :model-value="modelValue"
      :disabled="disabled"
      v-bind="resolvedProps"
      @update:model-value="update"
    >
      <ElCheckbox
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </ElCheckbox>
    </ElCheckboxGroup>

    <ElSwitch
      v-else-if="field.type === 'switch'"
      :model-value="modelValue"
      :disabled="disabled"
      v-bind="resolvedProps"
      @update:model-value="update"
    />

    <ElDatePicker
      v-else-if="field.type === 'date' || field.type === 'datetime'"
      :type="field.type"
      :model-value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :value-format="
        field.type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
      "
      v-bind="resolvedProps"
      @update:model-value="update"
    />

    <AsyncSelect
      v-else-if="
        field.type === 'async-select' &&
        (asyncSelectProps || field.optionSource === 'dict')
      "
      :model-value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :fetcher="entity ? fetchEntity : undefined"
      :options="entity ? undefined : options"
      v-bind="{ ...asyncSelectProps, ...resolvedProps }"
      @update:model-value="update"
    />

    <ReadonlyText v-else :value="modelValue" />

    <div v-if="field.tip" class="schema-form-item__tip">{{ field.tip }}</div>
  </ElFormItem>
</template>

<style scoped lang="scss">
.schema-form-item {
  &__dict-tag {
    :deep(.dict-tag + .dict-tag) {
      margin-left: 6px;
    }
  }

  :deep(.el-select),
  :deep(.el-input),
  :deep(.el-input-number),
  :deep(.el-date-editor) {
    width: 100%;
  }
}

.schema-form-item--bare {
  margin-bottom: 0;

  :deep(.el-form-item__label-wrap),
  :deep(.el-form-item__label) {
    display: none;
  }
}

.schema-form-item__tip {
  width: 100%;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}
</style>
