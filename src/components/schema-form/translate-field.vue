<script setup lang="ts">
import type {
  FieldContext,
  ResolvedField,
  TranslateCommand,
  TranslateConfig,
  TranslateHandlerContext,
  TranslateLanguage,
  TranslateLanguageValues,
} from './schema-form.type';

import { computed, ref, watch } from 'vue';

import { ElInput, ElMessage, ElTabPane, ElTabs } from 'element-plus';

import { $t as t } from '@/runtime/i18n';

import RichTextEditor from '../rich-text-editor/index.vue';
import { DEFAULT_TRANSLATE_LANGUAGES } from './schema-form.type';
import TranslateToolbar from './translate-toolbar.vue';

const props = withDefaults(
  defineProps<{
    config?: TranslateConfig;
    context: FieldContext;
    disabled?: boolean;
    field: ResolvedField;
    inputProps?: Record<string, any>;
    labelPosition?: 'left' | 'right' | 'top';
    modelValue?: unknown;
    placeholder?: string;
    readonly?: boolean;
  }>(),
  {
    config: undefined,
    disabled: false,
    inputProps: () => ({}),
    labelPosition: 'top',
    modelValue: undefined,
    placeholder: '',
    readonly: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: TranslateLanguageValues];
}>();

const languages = computed<TranslateLanguage[]>(() =>
  props.config?.language?.length
    ? props.config.language
    : DEFAULT_TRANSLATE_LANGUAGES,
);
const languageCodes = computed(() => languages.value.map(({ code }) => code));
const layout = computed(
  () =>
    props.config?.layout ??
    (['rich-text', 'text', 'textarea'].includes(props.field.type)
      ? 'tabs'
      : 'grid'),
);
const activeLanguageLabel = computed(
  () =>
    languages.value.find(({ code }) => code === activeLanguage.value)?.label ??
    '',
);
const values = computed<TranslateLanguageValues>(() => {
  if (
    props.modelValue &&
    typeof props.modelValue === 'object' &&
    !Array.isArray(props.modelValue)
  ) {
    return props.modelValue as TranslateLanguageValues;
  }
  if (typeof props.modelValue === 'string') {
    return { [languages.value[0]?.code ?? 'en']: props.modelValue };
  }
  return {};
});
const activeLanguage = ref('en');
const sourceLanguage = ref('en');
const targetLanguage = ref('all');
const translating = ref(false);
const disabled = computed(
  () => props.disabled || props.readonly || translating.value,
);

watch(
  languageCodes,
  (codes) => {
    if (!codes.includes(activeLanguage.value)) {
      activeLanguage.value = codes.includes('en') ? 'en' : (codes[0] ?? '');
    }
    if (!codes.includes(sourceLanguage.value)) {
      sourceLanguage.value = codes.includes('en') ? 'en' : (codes[0] ?? '');
    }
    if (
      targetLanguage.value !== 'all' &&
      (!codes.includes(targetLanguage.value) ||
        targetLanguage.value === sourceLanguage.value)
    ) {
      targetLanguage.value = 'all';
    }
  },
  { immediate: true },
);

function updateLanguageValue(language: string, value: unknown) {
  emit('update:modelValue', { ...values.value, [language]: value });
}

function getLanguageValue(language: string): number | string | undefined {
  const value = values.value[language];
  return typeof value === 'string' || typeof value === 'number'
    ? value
    : undefined;
}

async function translate(command: TranslateCommand = 'translate') {
  if (disabled.value || !sourceLanguage.value || !targetLanguage.value) return;

  const targets =
    targetLanguage.value === 'all'
      ? languageCodes.value.filter((code) => code !== sourceLanguage.value)
      : [targetLanguage.value];
  const before = { ...values.value };
  const sourceValue = before[sourceLanguage.value];
  const handlerContext: TranslateHandlerContext = {
    ...props.context,
    before,
    command,
    fieldProp: props.field.prop,
    fieldValue: before,
    sourceLanguage: sourceLanguage.value,
    sourceValue,
    targetLanguage: targetLanguage.value,
    targetLanguages: targets,
  };

  translating.value = true;
  try {
    const translated = props.config?.translate
      ? await props.config.translate(handlerContext)
      : Object.fromEntries(targets.map((code) => [code, sourceValue]));
    if (translated) {
      emit('update:modelValue', { ...before, ...translated });
      const translatedLanguage = targets.find(
        (language) => translated[language] !== undefined,
      );
      if (translatedLanguage) activeLanguage.value = translatedLanguage;
    }
    if (!props.config?.translate) {
      const targetLabels = targets
        .map(
          (code) => languages.value.find((item) => item.code === code)?.label,
        )
        .join(', ');
      ElMessage.info(
        t('product-management.attribute.translation.mockCopied', {
          targets: targetLabels,
        }),
      );
    } else {
      ElMessage.success(
        t('product-management.attribute.translation.completed'),
      );
    }
  } catch {
    ElMessage.error(t('product-management.attribute.translation.failed'));
  } finally {
    translating.value = false;
  }
}
</script>

<template>
  <div
    class="translate-field"
    :class="[
      `translate-field--label-${labelPosition}`,
      {
        'translate-field--plain-input':
          field.type === 'text' || field.type === 'textarea',
      },
    ]"
    v-loading="field.type === 'rich-text' && translating"
    :element-loading-text="
      t('product-management.attribute.translation.loading')
    "
  >
    <template v-if="layout === 'tabs'">
      <ElTabs v-model="activeLanguage" class="translate-field__tabs">
        <ElTabPane
          v-for="language in languages"
          :key="language.code"
          :label="language.label"
          :name="language.code"
        />
      </ElTabs>
      <RichTextEditor
        v-if="field.type === 'rich-text'"
        v-bind="inputProps"
        :id="`${field.prop}-${activeLanguage}`"
        :model-value="String(values[activeLanguage] ?? '')"
        :placeholder="placeholder || activeLanguageLabel"
        :editable="!disabled && inputProps.editable !== false"
        :max-height="inputProps.maxHeight ?? '220px'"
        @update:model-value="updateLanguageValue(activeLanguage, $event)"
      >
        <template #toolbar-append>
          <TranslateToolbar
            :languages="languages"
            :source-language="sourceLanguage"
            :target-language="targetLanguage"
            :disabled="disabled"
            :loading="translating"
            @update:source-language="sourceLanguage = $event"
            @update:target-language="targetLanguage = $event"
            @translate="translate"
          />
        </template>
      </RichTextEditor>
      <ElInput
        v-else
        v-bind="inputProps"
        :id="`${field.prop}-${activeLanguage}`"
        :model-value="getLanguageValue(activeLanguage)"
        :type="field.type === 'textarea' ? 'textarea' : 'text'"
        :rows="field.type === 'textarea' ? (inputProps.rows ?? 4) : undefined"
        :placeholder="placeholder || activeLanguageLabel"
        :disabled="disabled"
        @update:model-value="updateLanguageValue(activeLanguage, $event)"
      />
    </template>

    <div v-else class="translate-field__grid">
      <div
        v-for="language in languages"
        :key="language.code"
        class="translate-field__entry"
      >
        <label
          class="translate-field__label"
          :for="`${field.prop}-${language.code}`"
        >
          {{ language.label }}
        </label>
        <RichTextEditor
          v-if="field.type === 'rich-text'"
          v-bind="inputProps"
          :id="`${field.prop}-${language.code}`"
          :model-value="String(values[language.code] ?? '')"
          :placeholder="placeholder || language.label"
          :editable="!disabled && inputProps.editable !== false"
          :max-height="inputProps.maxHeight ?? '220px'"
          @update:model-value="updateLanguageValue(language.code, $event)"
        />
        <ElInput
          v-else
          v-bind="inputProps"
          :id="`${field.prop}-${language.code}`"
          :model-value="getLanguageValue(language.code)"
          :type="field.type === 'textarea' ? 'textarea' : 'text'"
          :rows="field.type === 'textarea' ? (inputProps.rows ?? 4) : undefined"
          :placeholder="placeholder || language.label"
          :disabled="disabled"
          @update:model-value="updateLanguageValue(language.code, $event)"
        />
      </div>
    </div>

    <TranslateToolbar
      v-if="layout !== 'tabs' || field.type !== 'rich-text'"
      :inline="field.type === 'text' || field.type === 'textarea'"
      :languages="languages"
      :source-language="sourceLanguage"
      :target-language="targetLanguage"
      :disabled="disabled"
      :loading="translating"
      class="translate-field__standalone-toolbar"
      @update:source-language="sourceLanguage = $event"
      @update:target-language="targetLanguage = $event"
      @translate="translate"
    />
  </div>
</template>

<style scoped lang="scss">
.translate-field {
  width: 100%;

  &__tabs {
    width: 100%;
    margin-bottom: 12px;
  }

  :deep(.el-tabs__nav-wrap) {
    margin: 0;
  }

  :deep(.el-tabs__header) {
    margin-bottom: 12px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px 20px;
    width: 100%;
  }

  &__entry {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  &__label {
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--el-text-color-secondary);
    text-align: left;
    white-space: nowrap;
  }

  &--label-left &__entry,
  &--label-right &__entry {
    display: grid;
    grid-template-columns: minmax(64px, 78px) minmax(0, 1fr);
    align-items: center;
  }

  &--label-left &__label {
    text-align: left;
  }

  &--label-right &__label {
    text-align: right;
  }

  &__standalone-toolbar {
    width: fit-content;
    max-width: 100%;
    margin-top: 12px;
    background: color-mix(in srgb, var(--el-color-primary-light-9) 45%, #fff);
  }

  :deep(.el-input),
  :deep(.el-textarea) {
    width: 100%;
    min-width: 0;
  }

  &--plain-input :deep(.el-input__wrapper),
  &--plain-input :deep(.el-textarea__inner) {
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    box-shadow: 0 0 0 1px transparent inset !important;

    &:hover {
      border-color: var(--el-border-color-hover);
    }

    &:focus,
    &.is-focus,
    &.is-focused {
      border-color: var(--el-color-primary);
    }
  }

  :deep(.rich-text-editor) {
    min-width: 0;
  }
}

@media (max-width: 1100px) {
  .translate-field__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .translate-field__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
