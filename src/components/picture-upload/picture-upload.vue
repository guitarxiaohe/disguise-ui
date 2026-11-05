<script setup lang="ts">
import type { AttachmentData } from '@/components/file-upload/file-upload.type';
import type { UploadRequestOptions } from 'element-plus';
import type {
  PictureUploadEmits,
  PictureUploadProps,
} from './picture-upload.type';

import { computed, nextTick, onBeforeUnmount, ref, toRefs, watch } from 'vue';

import { useFileUpload } from '@/components/file-upload/composables/use-file-upload';
import { useMultipleFileUpload } from '@/components/file-upload/composables/use-multiple-file-upload';
import { useImageUrl } from '@/composables/use-image-url';
import { Close, Download, Plus, ZoomIn } from '@element-plus/icons-vue';
import {
  ElIcon,
  ElImageViewer,
  ElMessage,
  ElProgress,
  ElUpload,
} from 'element-plus';

import { $t as t } from '@/runtime/i18n';
import ImageCropDialog from './image-crop-dialog.vue';

/** ****************************** 类型定义 ********************************/

/** ****************************** 组件入参 ********************************/

const props = withDefaults(defineProps<PictureUploadProps>(), {
  modelValue: '',
  disabled: false,
  maxSize: 5,
  accept: () => ['image/*'],
  width: 96,
  height: 96,
  showPreview: true,
  showDownload: true,
  showRemove: true,
  selected: false,
  errorMessage: '',
  baseFolder: '',
  maxCount: 1,
});

const emit = defineEmits<PictureUploadEmits>();
const slots = defineSlots<{
  /** 自定义已上传图片；多图模式会为每张图片调用 */
  picture?: (props: {
    download: () => void;
    file: AttachmentData;
    index: number;
    preview: () => void;
    remove: () => void;
    url: string;
  }) => any;
  /** 自定义上传中内容 */
  loading?: (props: { progress: number }) => any;
  /** 自定义空状态/上传触发器；default 作为兼容别名 */
  placeholder?: (props: { multiple: boolean }) => any;
  default?: (props: { multiple: boolean }) => any;
}>();

const { resolveImageUrl } = useImageUrl();
const { accept, errorMessage, maxSize } = toRefs(props);

const isMultiple = computed(
  () => props.maxCount > 1 || Array.isArray(props.modelValue),
);

const isStringArray = computed(
  () =>
    Array.isArray(props.modelValue) &&
    props.modelValue.every((item) => typeof item === 'string'),
);

const normalizeAttachment = (value: AttachmentData | string): AttachmentData =>
  typeof value === 'string' ? { url: value } : value;

const normalizedList = computed<AttachmentData[]>(() => {
  if (!Array.isArray(props.modelValue)) return [];
  return props.modelValue.map(normalizeAttachment);
});

const toModelValue = (value: AttachmentData[] | undefined) => {
  if (!value) return isStringArray.value ? [] : undefined;
  return isStringArray.value
    ? value.map((item) => item.fileUrl || item.url || '')
    : value;
};

/** ****************************** 上传状态 ********************************/

const previewVisible = ref<boolean>(false);
const localPreview = ref('');
const remoteFailed = ref(false);
const cropVisible = ref(false);
const cropFile = ref<File>();
type CropRequest = { file: File; resolve: (file: File | false) => void };
const cropQueue: CropRequest[] = [];
let activeCrop: CropRequest | undefined;

const upload = useFileUpload({
  modelValue: computed(() => {
    if (isMultiple.value) return undefined;
    return (
      (props.modelValue as AttachmentData | string | undefined) || undefined
    );
  }),
  maxSize,
  accept,
  errorMessage,
  baseFolder: computed(() => props.baseFolder || undefined),
  addWatermark: computed(() => props.addWatermark),
  onUpdate: (value) => {
    emit('update:modelValue', value);
  },
  onUploadSuccess: (file) => {
    emit('uploadSuccess', file);
  },
  onUploadError: (error) => {
    emit('uploadError', error);
  },
  onRemove: (file) => {
    emit('remove', file);
  },
  onPreview: (file) => {
    emit('preview', file);
  },
  onDownload: (file) => {
    emit('download', file);
  },
});

const multipleUpload = useMultipleFileUpload({
  modelValue: computed(() =>
    isMultiple.value ? normalizedList.value : undefined,
  ),
  maxSize,
  accept,
  maxCount: toRefs(props).maxCount,
  errorMessage,
  baseFolder: computed(() => props.baseFolder || undefined),
  addWatermark: computed(() => props.addWatermark),
  onUpdate: (value) => emit('update:modelValue', toModelValue(value)),
  onUploadSuccess: (file) => emit('uploadSuccess', file),
  onUploadError: (error) => emit('uploadError', error),
  onRemove: (file) => emit('remove', file),
  onPreview: (file) => emit('preview', file),
  onDownload: (file) => emit('download', file),
});

const containerStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
}));

const remoteUrl = computed(() =>
  resolveImageUrl(
    upload.fileData.value?.fileUrl ||
      upload.fileData.value?.url ||
      upload.fileUrl.value ||
      '',
  ),
);

const multipleImageUrls = computed(() =>
  normalizedList.value.map((file) =>
    resolveImageUrl(file.fileUrl || file.url || file.name || ''),
  ),
);

watch(remoteUrl, () => {
  remoteFailed.value = false;
});

const imageUrl = computed(() => {
  if (remoteFailed.value && localPreview.value) return localPreview.value;
  return remoteUrl.value || localPreview.value;
});

const previewUrls = ref<string[]>([]);
const previewIndex = ref(0);

function revokeLocalPreview() {
  if (!localPreview.value.startsWith('blob:')) return;
  URL.revokeObjectURL(localPreview.value);
  localPreview.value = '';
}

function onImageError() {
  if (localPreview.value && imageUrl.value !== localPreview.value) {
    remoteFailed.value = true;
  }
}

onBeforeUnmount(() => {
  revokeLocalPreview();
  activeCrop?.resolve(false);
  cropQueue.splice(0).forEach((request) => request.resolve(false));
});

const isEmpty = computed(() =>
  isMultiple.value
    ? normalizedList.value.length === 0 && !multipleUpload.loading.value
    : !imageUrl.value && !upload.loading.value,
);

const acceptAttr = computed(() =>
  isMultiple.value ? multipleUpload.acceptAttr.value : upload.acceptAttr.value,
);

const uploadError = computed(() =>
  isMultiple.value ? multipleUpload.isError.value : upload.isError.value,
);

const uploaderClass = computed(() => ({
  'picture-upload__uploader--selected':
    props.selected && !isEmpty.value && !uploadError.value,
  'picture-upload__uploader--error': uploadError.value,
  'is-disabled': props.disabled,
}));

/** ****************************** 事件方法 ********************************/

// 上传图片
function handleUpload(options: UploadRequestOptions) {
  if (isMultiple.value) {
    return multipleUpload.handleUpload(options);
  }
  revokeLocalPreview();
  localPreview.value = URL.createObjectURL(options.file);
  remoteFailed.value = false;
  return upload.handleUpload(options);
}

async function handleBeforeUpload(
  file: Parameters<NonNullable<typeof upload.beforeUpload>>[0],
) {
  let finalFile: File = file;

  if (props.crop?.enabled) {
    if (!isAcceptedImage(file)) {
      ElMessage.error(
        t('components.fileUpload.typeNotAllowed', {
          types: props.accept.join(', '),
        }),
      );
      return false;
    }
    const croppedFile = await requestCrop(file);
    if (!croppedFile) return false;
    finalFile = croppedFile;
  }

  const dimensionError = await validateImageDimensions(finalFile);
  if (dimensionError) {
    ElMessage.error(dimensionError);
    return false;
  }

  const validationResult = isMultiple.value
    ? multipleUpload.beforeUpload(finalFile as typeof file)
    : upload.beforeUpload(finalFile as typeof file);
  if (validationResult === false) return false;
  return finalFile;
}

function isAcceptedImage(file: File) {
  return (
    props.accept.length === 0 ||
    props.accept.some((accepted) => {
      if (accepted.startsWith('.')) {
        return file.name.toLowerCase().endsWith(accepted.toLowerCase());
      }
      const pattern = accepted.toLowerCase().replace('*', '');
      return file.type.toLowerCase().startsWith(pattern);
    })
  );
}

function requestCrop(file: File) {
  return new Promise<File | false>((resolve) => {
    cropQueue.push({ file, resolve });
    showNextCrop();
  });
}

function showNextCrop() {
  if (activeCrop || cropQueue.length === 0) return;
  activeCrop = cropQueue.shift();
  cropFile.value = activeCrop?.file;
  cropVisible.value = !!activeCrop;
}

function finishCrop(file: File | false) {
  const request = activeCrop;
  if (!request) return;
  activeCrop = undefined;
  cropVisible.value = false;
  cropFile.value = undefined;
  request.resolve(file);
  void nextTick(showNextCrop);
}

async function validateImageDimensions(file: File) {
  const limits = props.dimensions;
  if (!limits) return '';
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const candidate = new Image();
      candidate.onload = () => resolve(candidate);
      candidate.onerror = () =>
        reject(new Error(t('components.pictureUpload.readFailed')));
      candidate.src = url;
    });
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (limits.width !== undefined && width !== limits.width)
      return t('components.pictureUpload.widthExact', { width: limits.width });
    if (limits.height !== undefined && height !== limits.height)
      return t('components.pictureUpload.heightExact', {
        height: limits.height,
      });
    if (limits.minWidth !== undefined && width < limits.minWidth)
      return t('components.pictureUpload.widthMin', { width: limits.minWidth });
    if (limits.minHeight !== undefined && height < limits.minHeight)
      return t('components.pictureUpload.heightMin', {
        height: limits.minHeight,
      });
    if (limits.maxWidth !== undefined && width > limits.maxWidth)
      return t('components.pictureUpload.widthMax', { width: limits.maxWidth });
    if (limits.maxHeight !== undefined && height > limits.maxHeight)
      return t('components.pictureUpload.heightMax', {
        height: limits.maxHeight,
      });
    return '';
  } catch (error) {
    return error instanceof Error
      ? error.message
      : t('components.pictureUpload.readFailed');
  } finally {
    URL.revokeObjectURL(url);
  }
}

// 预览图片
function handlePreview() {
  if (!imageUrl.value || !props.showPreview) return;
  previewVisible.value = true;
  if (upload.fileData.value) {
    emit('preview', upload.fileData.value);
  }
}

function handleMultiplePreview(index: number) {
  if (!props.showPreview || !multipleImageUrls.value[index]) return;
  previewUrls.value = multipleImageUrls.value;
  previewIndex.value = index;
  previewVisible.value = true;
  const file = normalizedList.value[index];
  if (file) emit('preview', file);
}

// 下载图片
function handleDownload() {
  if (!props.showDownload) return;
  if (!imageUrl.value || !upload.fileData.value) {
    ElMessage.error(t('components.fileUpload.fileDownloadError'));
    return;
  }
  upload.handleDownload();
}

function handleMultipleDownload(file: AttachmentData) {
  if (!props.showDownload) return;
  const url = resolveImageUrl(file.fileUrl || file.url || file.name || '');
  if (!url) {
    ElMessage.error(t('components.fileUpload.fileDownloadError'));
    return;
  }
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name || 'image';
  link.click();
  emit('download', file);
}

// 删除图片
function handleRemove() {
  if (isMultiple.value) return;
  if (!props.showRemove || props.disabled) return;
  revokeLocalPreview();
  remoteFailed.value = false;
  upload.handleRemove();
}

function handleMultipleRemove(file: AttachmentData) {
  if (!props.showRemove || props.disabled) return;
  const url = file.fileUrl || file.url || file.name || '';
  const next = normalizedList.value.filter(
    (item) => (item.fileUrl || item.url || item.name || '') !== url,
  );
  emit('update:modelValue', toModelValue(next));
  emit('remove', file);
}
</script>

<template>
  <div class="picture-upload">
    <ElUpload
      v-if="isMultiple"
      class="picture-upload__uploader picture-upload__uploader--multiple"
      :class="uploaderClass"
      :show-file-list="false"
      :multiple="true"
      :before-upload="handleBeforeUpload"
      :http-request="handleUpload"
      :disabled="
        props.disabled ||
        multipleUpload.loading.value ||
        (props.maxCount > 1 && normalizedList.length >= props.maxCount)
      "
      :accept="acceptAttr"
    >
      <div class="picture-upload__multiple-grid">
        <div
          v-for="(file, index) in normalizedList"
          :key="file.fileUrl || file.url || file.name || index"
          class="picture-upload__image-wrap"
          :style="containerStyle"
        >
          <slot
            v-if="slots.picture"
            name="picture"
            :file="file"
            :url="multipleImageUrls[index]"
            :index="index"
            :preview="() => handleMultiplePreview(index)"
            :download="() => handleMultipleDownload(file)"
            :remove="() => handleMultipleRemove(file)"
          ></slot>
          <img
            v-else
            class="picture-upload__image"
            :src="multipleImageUrls[index]"
            alt=""
            referrerpolicy="no-referrer"
          />
          <button
            v-if="!slots.picture && props.showRemove && !props.disabled"
            type="button"
            class="picture-upload__remove"
            :aria-label="t('components.fileUpload.remove')"
            @click.stop.prevent="handleMultipleRemove(file)"
          >
            <ElIcon :size="12"><Close /></ElIcon>
          </button>
          <div v-if="!slots.picture" class="picture-upload__actions">
            <button
              v-if="props.showPreview"
              type="button"
              class="picture-upload__action"
              :aria-label="t('components.fileUpload.preview')"
              @click.stop.prevent="handleMultiplePreview(index)"
            >
              <ElIcon :size="20" color="#fff"><ZoomIn /></ElIcon>
            </button>
            <button
              v-if="props.showDownload"
              type="button"
              class="picture-upload__action"
              :aria-label="t('components.fileUpload.download')"
              @click.stop.prevent="handleMultipleDownload(file)"
            >
              <ElIcon :size="20" color="#fff"><Download /></ElIcon>
            </button>
          </div>
        </div>

        <div
          v-if="multipleUpload.loading.value"
          class="picture-upload__loading"
          :style="containerStyle"
        >
          <slot name="loading" :progress="multipleUpload.totalProgress.value">
            <ElProgress
              type="circle"
              :width="Math.min(props.width, props.height, 72)"
              :percentage="multipleUpload.totalProgress.value"
            />
          </slot>
        </div>

        <div
          v-if="props.maxCount <= 1 || normalizedList.length < props.maxCount"
          class="picture-upload__placeholder"
          :style="containerStyle"
        >
          <slot name="placeholder" :multiple="true">
            <slot :multiple="true">
              <ElIcon class="picture-upload__placeholder-icon" :size="28">
                <Plus />
              </ElIcon>
            </slot>
          </slot>
        </div>
      </div>
    </ElUpload>

    <ElUpload
      v-else
      class="picture-upload__uploader"
      :class="uploaderClass"
      :show-file-list="false"
      :before-upload="handleBeforeUpload"
      :http-request="handleUpload"
      :disabled="props.disabled || upload.loading.value"
      :accept="acceptAttr"
    >
      <!-------------------------- 上传中 -------------------------->
      <div
        v-if="upload.loading.value"
        class="picture-upload__loading"
        :style="containerStyle"
      >
        <slot name="loading" :progress="upload.uploadProgress.value">
          <ElProgress
            type="circle"
            :width="Math.min(props.width, props.height, 72)"
            :percentage="upload.uploadProgress.value"
          />
        </slot>
      </div>

      <!-------------------------- 图片内容 -------------------------->
      <div
        v-else-if="!isEmpty"
        class="picture-upload__image-wrap"
        :style="containerStyle"
      >
        <slot
          v-if="slots.picture && upload.fileData.value"
          name="picture"
          :file="upload.fileData.value"
          :url="imageUrl"
          :index="0"
          :preview="handlePreview"
          :download="handleDownload"
          :remove="handleRemove"
        ></slot>
        <img
          v-else
          class="picture-upload__image"
          :src="imageUrl"
          alt=""
          referrerpolicy="no-referrer"
          @error="onImageError"
        />

        <button
          v-if="!slots.picture && props.showRemove && !props.disabled"
          type="button"
          class="picture-upload__remove"
          :aria-label="t('components.fileUpload.remove')"
          @click.stop.prevent="handleRemove"
        >
          <ElIcon :size="12">
            <Close />
          </ElIcon>
        </button>

        <div v-if="!slots.picture" class="picture-upload__actions">
          <button
            v-if="props.showPreview"
            type="button"
            class="picture-upload__action"
            :aria-label="t('components.fileUpload.preview')"
            @click.stop.prevent="handlePreview"
          >
            <ElIcon :size="20" color="#fff">
              <ZoomIn />
            </ElIcon>
          </button>
          <button
            v-if="props.showDownload"
            type="button"
            class="picture-upload__action"
            :aria-label="t('components.fileUpload.download')"
            @click.stop.prevent="handleDownload"
          >
            <ElIcon :size="20" color="#fff">
              <Download />
            </ElIcon>
          </button>
        </div>
      </div>

      <!-------------------------- 空状态 -------------------------->
      <div v-else class="picture-upload__placeholder" :style="containerStyle">
        <slot name="placeholder" :multiple="false">
          <slot :multiple="false">
            <ElIcon class="picture-upload__placeholder-icon" :size="28">
              <Plus />
            </ElIcon>
          </slot>
        </slot>
      </div>
    </ElUpload>

    <!-------------------------- 图片预览 -------------------------->
    <ElImageViewer
      v-if="previewVisible"
      :url-list="isMultiple ? previewUrls : [imageUrl]"
      :initial-index="isMultiple ? previewIndex : 0"
      @close="previewVisible = false"
    />

    <ImageCropDialog
      v-model="cropVisible"
      :file="cropFile"
      :crop="props.crop"
      :dimensions="props.dimensions"
      @confirm="finishCrop"
      @cancel="finishCrop(false)"
    />
  </div>
</template>

<style scoped lang="scss">
.picture-upload {
  display: inline-block;
}

.picture-upload__uploader {
  display: inline-block;

  :deep(.el-upload) {
    display: block;
    overflow: hidden;
    cursor: pointer;
    border-radius: var(--radius-md);
  }

  &.is-disabled :deep(.el-upload) {
    cursor: not-allowed;
  }
}

.picture-upload__uploader--multiple {
  :deep(.el-upload) {
    overflow: visible;
  }
}

.picture-upload__multiple-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.picture-upload__uploader--selected :deep(.el-upload) {
  box-shadow: 0 0 0 2px var(--color-primary-bg);
}

.picture-upload__uploader--error :deep(.el-upload) {
  box-shadow: 0 0 0 1px var(--color-danger);
}

.picture-upload__placeholder,
.picture-upload__loading,
.picture-upload__image-wrap {
  border-radius: var(--radius-md);
}

.picture-upload__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-card);
  border: 1px dashed var(--color-border);
  transition:
    border-color var(--transition-fast),
    color var(--transition-fast);

  &:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }
}

.picture-upload__placeholder-icon {
  color: var(--color-text-secondary);

  :deep(svg) {
    width: 1em;
    height: 1em;
  }
}

.picture-upload__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-hover);
  border: 1px solid var(--color-border);
}

.picture-upload__image-wrap {
  position: relative;
  overflow: hidden;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
}

.picture-upload__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.picture-upload__remove,
.picture-upload__action {
  padding: 0;
  cursor: pointer;
  border: 0;

  :deep(svg) {
    width: 1em;
    height: 1em;
  }
}

.picture-upload__remove {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: #4b5563;
  background: rgb(255 255 255 / 88%);
  border-radius: 50%;
  box-shadow: 0 2px 6px rgb(0 0 0 / 8%);

  &:hover {
    color: #dc2626;
    background: #fef2f2;
  }
}

.picture-upload__actions {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgb(17 24 39 / 45%);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.picture-upload__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border-radius: var(--radius-full);
  transition:
    background-color var(--transition-fast),
    transform var(--transition-fast);

  &:hover {
    background: rgb(255 255 255 / 16%);
    transform: scale(1.08);
  }
}

.picture-upload__image-wrap:hover .picture-upload__actions {
  opacity: 1;
}

.picture-upload__uploader.is-disabled {
  .picture-upload__placeholder,
  .picture-upload__image-wrap {
    pointer-events: none;
    opacity: 0.6;
  }
}
</style>
