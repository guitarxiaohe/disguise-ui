<script setup lang="ts">
import type { DrawerFormPageProps, DrawerFormValues } from './index.type';

import { computed, nextTick, ref, useSlots, watch } from 'vue';

import { Close, FullScreen, ScaleToOriginal } from '@element-plus/icons-vue';
import { ElButton, ElDrawer, ElTooltip } from 'element-plus';

import SchemaForm from '../schema-form/schema-form.vue';

const props = withDefaults(defineProps<DrawerFormPageProps>(), {
  modelValue: false,
  title: '',
  mode: 'create',
  schema: () => [],
  formValues: () => ({}),
  size: '560px',
  direction: 'rtl',
  fullscreenButton: true,
  fullscreen: false,
  normalColumns: undefined,
  fullscreenColumns: undefined,
  showFooter: true,
  showCancelButton: true,
  showSubmitButton: true,
  cancelText: '取消',
  submitText: '确定',
  loading: false,
  submitting: false,
  disabled: false,
  destroyOnClose: false,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  appendToBody: true,
  lockScroll: true,
  drawerProps: () => ({}),
  schemaFormProps: () => ({}),
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:formValues': [value: DrawerFormValues];
  'update:fullscreen': [value: boolean];
  submit: [value: DrawerFormValues];
  cancel: [];
  open: [];
  closed: [];
}>();
const groupModel = ref(0);
const slots = useSlots();
const formRef = ref<InstanceType<typeof SchemaForm>>();
const contentRef = ref<HTMLElement>();
const internalFullscreen = ref(props.fullscreen);

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const formValues = computed({
  get: () => props.formValues ?? {},
  set: (value: DrawerFormValues) => emit('update:formValues', value),
});

const isFullscreen = computed(() => internalFullscreen.value);
const drawerSize = computed(() => (isFullscreen.value ? '100%' : props.size));
const formColumns = computed(() => {
  if (isFullscreen.value) {
    return (
      props.fullscreenColumns ??
      Math.max(3, props.schemaFormProps?.columns ?? 1)
    );
  }
  if (props.mode === 'view') return 2;
  return props.normalColumns ?? props.schemaFormProps?.columns ?? 1;
});
const shouldShowSubmit = computed(
  () => props.showSubmitButton && props.mode !== 'view',
);
const resolvedStatusText = computed(
  () =>
    props.statusText ??
    { create: '新建中', edit: '编辑中', view: '查看中' }[props.mode] ??
    '',
);
const fieldSlotNames = computed(() =>
  Object.keys(slots).filter(
    (name) => !['default', 'footer', 'header'].includes(name),
  ),
);
const anchorGroups = computed(() =>
  props.schema
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.type === 'group' && entry.anchor),
);

watch(
  () => props.fullscreen,
  (value) => {
    internalFullscreen.value = value;
  },
);

function toggleFullscreen() {
  internalFullscreen.value = !internalFullscreen.value;
  emit('update:fullscreen', internalFullscreen.value);
}

async function scrollToAnchor(index: number) {
  await nextTick();
  const target = contentRef.value?.querySelector<HTMLElement>(
    `[data-form-anchor="${index}"]`,
  );
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function close() {
  if (props.submitting) return;
  visible.value = false;
}

function handleCancel() {
  close();
  emit('cancel');
}

async function validate() {
  return (await formRef.value?.validate()) ?? false;
}

function getValues() {
  return formRef.value?.getValues() ?? {};
}

async function submit() {
  if (props.mode === 'view' || props.submitting || props.loading) return false;
  if (!(await validate())) return false;

  emit('submit', getValues());
  return true;
}

function resetFields() {
  formRef.value?.resetFields();
}

function handleClosed() {
  emit('closed');
}

function handleOpen() {
  groupModel.value = anchorGroups.value[0]?.index ?? 0;
  emit('open');
}

function handleContentScroll() {
  const root = contentRef.value;
  if (!root) return;
  const rootTop = root.getBoundingClientRect().top;
  let current = anchorGroups.value[0]?.index ?? 0;
  for (const { index } of anchorGroups.value) {
    const target = root.querySelector<HTMLElement>(
      `[data-form-anchor="${index}"]`,
    );
    if (target && target.getBoundingClientRect().top <= rootTop + 80) {
      current = index;
    }
  }
  groupModel.value = current;
}

defineExpose({
  close,
  getValues,
  resetFields,
  submit,
  toggleFullscreen,
  validate,
});
</script>

<template>
  <ElDrawer
    v-model="visible"
    v-bind="props.drawerProps"
    :size="drawerSize"
    :direction="props.direction"
    :show-close="false"
    :destroy-on-close="props.destroyOnClose"
    :close-on-click-modal="props.closeOnClickModal"
    :close-on-press-escape="props.closeOnPressEscape"
    :append-to-body="props.appendToBody"
    :lock-scroll="props.lockScroll"
    class="drawer-form-page"
    :class="{ 'drawer-form-page--fullscreen': isFullscreen }"
    @open="handleOpen"
    @closed="handleClosed"
  >
    <template #header>
      <slot
        name="header"
        :fullscreen="isFullscreen"
        :title="props.title"
        :toggle-fullscreen="toggleFullscreen"
      >
        <div class="drawer-form-page__header">
          <div class="drawer-form-page__header-main">
            <div class="drawer-form-page__title-stack">
              <!-- <span
                v-if="props.breadcrumb"
                class="drawer-form-page__breadcrumb"
              >
                {{ props.breadcrumb }}
              </span> -->
              <span class="drawer-form-page__title">{{ props.title }}</span>
            </div>
          </div>
          <div class="drawer-form-page__header-actions">
            <span class="drawer-form-page__status">
              <i aria-hidden="true"></i>
              {{ resolvedStatusText }}
            </span>
            <ElTooltip
              v-if="props.fullscreenButton"
              :content="isFullscreen ? '退出全屏' : '全屏'"
              placement="bottom"
            >
              <ElButton
                link
                :icon="isFullscreen ? ScaleToOriginal : FullScreen"
                :aria-label="isFullscreen ? '退出全屏' : '全屏'"
                @click="toggleFullscreen"
              />
            </ElTooltip>
            <ElTooltip content="关闭" placement="bottom">
              <ElButton
                link
                class="drawer-form-page__close"
                :icon="Close"
                aria-label="关闭"
                @click="close"
              />
            </ElTooltip>
          </div>
          <nav
            v-if="anchorGroups.length"
            class="drawer-form-page__anchors"
            aria-label="表单分区"
          >
            <button
              v-for="{ entry, index } in anchorGroups"
              :key="index"
              type="button"
              class="drawer-form-page__anchor"
              :class="{ 'is-active': groupModel === index }"
              @click="
                groupModel = index;
                scrollToAnchor(index);
              "
            >
              {{ entry.label }}
            </button>
          </nav>
        </div>
      </slot>
    </template>

    <div
      ref="contentRef"
      class="drawer-form-page__content"
      v-loading="props.loading"
      @scroll.passive="handleContentScroll"
    >
      <SchemaForm
        ref="formRef"
        v-bind="props.schemaFormProps"
        v-model="formValues"
        :schema="props.schema"
        :mode="props.mode"
        :columns="formColumns"
        :disabled="props.disabled"
        :loading="props.loading"
      >
        <template
          v-for="slotName in fieldSlotNames"
          :key="slotName"
          #[slotName]="slotProps"
        >
          <slot :name="slotName" v-bind="slotProps"></slot>
        </template>
      </SchemaForm>

      <slot></slot>
    </div>

    <template v-if="props.showFooter" #footer>
      <slot
        name="footer"
        :cancel="handleCancel"
        :submit="submit"
        :submitting="props.submitting"
      >
        <div class="drawer-form-page__footer">
          <ElButton
            v-if="props.showCancelButton"
            :disabled="props.submitting"
            @click="handleCancel"
          >
            {{ props.cancelText }}
          </ElButton>
          <ElButton
            v-if="shouldShowSubmit"
            type="primary"
            :disabled="props.loading"
            :loading="props.submitting"
            @click="submit"
          >
            {{ props.submitText }}
          </ElButton>
        </div>
      </slot>
    </template>
  </ElDrawer>
</template>

<style scoped lang="scss">
.drawer-form-page {
  :deep(.el-drawer__header) {
    padding: 0;
    margin-bottom: 0;
    background: var(--el-fill-color-lighter);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  :deep(.el-drawer__body) {
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 0;
  }

  :deep(.el-drawer__footer) {
    padding: 12px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

.drawer-form-page__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.drawer-form-page__footer {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
}

.drawer-form-page__header-main {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  min-height: 36px;
}

.drawer-form-page__title-stack {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.drawer-form-page__breadcrumb {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  line-height: 14px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.drawer-form-page__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 18px;
  font-weight: 600;
  line-height: 20px;
  white-space: nowrap;
}

.drawer-form-page__header-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-left: 16px;
}

.drawer-form-page__close {
  --el-button-text-color: #666;
  --el-button-hover-text-color: #666;
  --el-button-active-text-color: #666;

  width: 22px;
  height: 22px;
  padding: 0;
  font-size: 22px;
  color: #666;

  :deep(.el-icon) {
    width: 22px;
    height: 22px;
    font-size: 22px;
  }
}

.drawer-form-page__status {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  margin-right: 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.drawer-form-page__status i {
  width: 6px;
  height: 6px;
  background: var(--el-color-success);
  border-radius: 50%;
  box-shadow: 0 0 0 3px var(--el-color-success-light-9);
}

.drawer-form-page__anchors {
  display: flex;
  grid-column: 1 / -1;
  gap: 36px;
  width: 100%;
  height: 32px;
  padding: 0 14px;
  overflow-x: auto;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
}

.drawer-form-page__anchor {
  position: relative;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  padding: 0 1px;
  font: inherit;
  color: var(--el-text-color-regular);
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.drawer-form-page__anchor::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  content: '';
  background: transparent;
}

.drawer-form-page__anchor:hover,
.drawer-form-page__anchor.is-active {
  color: var(--el-color-primary);
}

.drawer-form-page__anchor.is-active {
  font-weight: 500;
}

.drawer-form-page__anchor.is-active::after {
  background: var(--el-color-primary);
}

.drawer-form-page__content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
