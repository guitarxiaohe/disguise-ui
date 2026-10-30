<script setup lang="ts">
import type { TranslateCommand, TranslateLanguage } from './schema-form.type';

import { computed } from 'vue';

import { Languages } from 'lucide-vue-next';

import { ChatDotRound } from '@element-plus/icons-vue';
import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElOption,
  ElPopover,
  ElSelect,
} from 'element-plus';

import { $t as t } from '@/runtime/i18n';

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    inline?: boolean;
    languages: TranslateLanguage[];
    loading?: boolean;
    sourceLanguage: string;
    targetLanguage: string;
  }>(),
  { disabled: false, inline: false, loading: false },
);

const emit = defineEmits<{
  'update:sourceLanguage': [value: string];
  'update:targetLanguage': [value: string];
  translate: [command: TranslateCommand];
}>();

const targetOptions = computed(() => [
  ...props.languages.filter(({ code }) => code !== props.sourceLanguage),
  { code: 'all', label: t('product-management.attribute.translation.all') },
]);

function handleCommand(command: string) {
  if (command === 'translate' || command === 'polish') {
    emit('translate', command);
  }
}
</script>

<template>
  <div v-if="inline" class="translate-toolbar__inline">
    <span class="translate-toolbar__label">
      <Languages
        class="translate-toolbar__label-icon"
        :size="16"
        color="#8994BC"
        :stroke-width="2"
      />
      {{ t('product-management.attribute.translation.label') }}
    </span>
    <div class="translate-toolbar__controls">
      <ElSelect
        :model-value="sourceLanguage"
        :disabled="disabled || loading"
        :placeholder="t('product-management.attribute.translation.from')"
        class="translate-toolbar__language-select"
        @update:model-value="emit('update:sourceLanguage', String($event))"
      >
        <ElOption
          v-for="language in languages"
          :key="language.code"
          :label="language.label"
          :value="language.code"
        />
      </ElSelect>
      <span class="translate-toolbar__arrow" aria-hidden="true">→</span>
      <ElSelect
        :model-value="targetLanguage"
        :disabled="disabled || loading"
        :placeholder="t('product-management.attribute.translation.to')"
        class="translate-toolbar__language-select"
        @update:model-value="emit('update:targetLanguage', String($event))"
      >
        <ElOption
          v-for="language in targetOptions"
          :key="language.code"
          :label="language.label"
          :value="language.code"
        />
      </ElSelect>
      <ElDropdown
        split-button
        type="primary"
        class="translate-toolbar__action"
        :disabled="disabled || loading || !sourceLanguage || !targetLanguage"
        @click="emit('translate', 'translate')"
        @command="handleCommand"
      >
        {{ t('product-management.attribute.translation.translate') }}
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem command="translate">
              {{ t('product-management.attribute.translation.translate') }}
            </ElDropdownItem>
            <ElDropdownItem command="polish">
              {{ t('product-management.attribute.translation.polish') }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </div>
  </div>

  <ElPopover
    v-else
    :width="390"
    placement="bottom-end"
    :disabled="disabled"
    trigger="hover"
  >
    <template #reference>
      <ElButton
        text
        :icon="ChatDotRound"
        :disabled="disabled"
        size="large"
        :title="t('product-management.attribute.translation.label')"
        :aria-label="t('product-management.attribute.translation.label')"
      />
    </template>

    <div class="translate-toolbar__row">
      <ElSelect
        :model-value="sourceLanguage"
        :disabled="disabled || loading"
        :placeholder="t('product-management.attribute.translation.from')"
        class="translate-toolbar__language-select"
        @update:model-value="emit('update:sourceLanguage', String($event))"
      >
        <ElOption
          v-for="language in languages"
          :key="language.code"
          :label="language.label"
          :value="language.code"
        />
      </ElSelect>
      <span class="translate-toolbar__arrow" aria-hidden="true">→</span>
      <ElSelect
        :model-value="targetLanguage"
        :disabled="disabled || loading"
        :placeholder="t('product-management.attribute.translation.to')"
        class="translate-toolbar__language-select"
        @update:model-value="emit('update:targetLanguage', String($event))"
      >
        <ElOption
          v-for="language in targetOptions"
          :key="language.code"
          :label="language.label"
          :value="language.code"
        />
      </ElSelect>
      <ElDropdown
        split-button
        type="primary"
        class="translate-toolbar__action"
        :disabled="disabled || loading || !sourceLanguage || !targetLanguage"
        @click="emit('translate', 'translate')"
        @command="handleCommand"
      >
        {{ t('product-management.attribute.translation.translate') }}
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem command="translate">
              {{ t('product-management.attribute.translation.translate') }}
            </ElDropdownItem>
            <ElDropdownItem command="polish">
              {{ t('product-management.attribute.translation.polish') }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </div>
  </ElPopover>
</template>

<style scoped lang="scss">
.translate-toolbar {
  &__inline {
    display: flex;
    flex-wrap: nowrap;
    gap: 12px;
    align-items: center;
    width: fit-content;
    max-width: 100%;
    padding: 6px 10px;
    background: color-mix(in srgb, var(--el-color-primary-light-9) 45%, #fff);
    border-radius: 4px;
  }

  &__label {
    display: inline-flex;
    flex: 0 0 auto;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    line-height: 32px;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }

  &__label-icon {
    flex: 0 0 auto;
    color: #8994bc;
  }

  &__controls,
  &__row {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  &__controls {
    flex: 0 0 auto;
  }

  &__row {
    width: 100%;
  }

  &__language-select {
    flex: 1 1 0;
    min-width: 0;
  }

  &__arrow {
    flex: 0 0 auto;
    color: var(--el-text-color-secondary);
  }

  &__action {
    flex: 0 0 auto;

    :deep(.el-button-group) {
      display: inline-flex;
      flex-wrap: nowrap;
    }

    :deep(.el-button) {
      height: var(--el-component-size);
    }
  }
}

.translate-toolbar__inline .translate-toolbar__language-select {
  flex: 0 1 140px;
  width: 140px;
  min-width: 110px;
}

@media (max-width: 640px) {
  .translate-toolbar__inline,
  .translate-toolbar__controls,
  .translate-toolbar__row {
    width: 100%;
  }

  .translate-toolbar__inline {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .translate-toolbar__controls,
  .translate-toolbar__row {
    flex-wrap: wrap;
  }
}
</style>
