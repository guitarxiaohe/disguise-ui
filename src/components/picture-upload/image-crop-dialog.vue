<script setup lang="ts">
import type { PictureCropOptions, PictureDimensionOptions } from './picture-upload.type';

import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { ElButton, ElDialog, ElMessage } from 'element-plus';

import { $t as t } from '@/runtime/i18n';

const props = defineProps<{
  crop?: PictureCropOptions;
  dimensions?: PictureDimensionOptions;
  file?: File;
  modelValue: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
  confirm: [file: File];
  'update:modelValue': [value: boolean];
}>();

type CropRect = { height: number; width: number; x: number; y: number };
type ResizeCorner = 'ne' | 'nw' | 'se' | 'sw';

const imageRef = ref<HTMLImageElement>();
const imageUrl = ref('');
const working = ref(false);
const selectedCropRatio = ref<number | null>();
const imageSize = reactive({ height: 0, naturalHeight: 0, naturalWidth: 0, width: 0 });
const cropRect = reactive<CropRect>({ height: 0, width: 0, x: 0, y: 0 });
let pointerOperation:
  | {
      corner?: ResizeCorner;
      mode: 'move' | 'resize';
      pointerId: number;
      start: CropRect;
      startX: number;
      startY: number;
    }
  | undefined;

const ratioOptions = computed(() => props.crop?.aspectRatios ?? []);

const dimensionAspectRatio = computed(() => {
  const { height, width } = props.dimensions ?? {};
  return height && width ? width / height : undefined;
});

const aspectRatio = computed(() => {
  if (dimensionAspectRatio.value) return dimensionAspectRatio.value;
  const ratio = selectedCropRatio.value;
  return ratio && ratio > 0 ? ratio : undefined;
});

const selectedSize = computed(() => ({
  height: imageSize.height
    ? Math.max(1, Math.round((cropRect.height / imageSize.height) * imageSize.naturalHeight))
    : 0,
  width: imageSize.width
    ? Math.max(1, Math.round((cropRect.width / imageSize.width) * imageSize.naturalWidth))
    : 0,
}));

const resultSize = computed(() => {
  const selected = selectedSize.value;
  const exactWidth = props.dimensions?.width;
  const exactHeight = props.dimensions?.height;
  if (exactWidth && exactHeight) return { height: exactHeight, width: exactWidth };
  if (exactWidth && selected.width) {
    return {
      height: Math.max(1, Math.round((exactWidth / selected.width) * selected.height)),
      width: exactWidth,
    };
  }
  if (exactHeight && selected.height) {
    return {
      height: exactHeight,
      width: Math.max(1, Math.round((exactHeight / selected.height) * selected.width)),
    };
  }
  return selected;
});

const dimensionError = computed(() => {
  const limits = props.dimensions;
  const { height, width } = resultSize.value;
  if (!limits || !width || !height) return '';
  if (limits.width !== undefined && width !== limits.width)
    return t('components.pictureUpload.widthExact', { width: limits.width });
  if (limits.height !== undefined && height !== limits.height)
    return t('components.pictureUpload.heightExact', { height: limits.height });
  if (limits.minWidth !== undefined && width < limits.minWidth)
    return t('components.pictureUpload.widthMin', { width: limits.minWidth });
  if (limits.minHeight !== undefined && height < limits.minHeight)
    return t('components.pictureUpload.heightMin', { height: limits.minHeight });
  if (limits.maxWidth !== undefined && width > limits.maxWidth)
    return t('components.pictureUpload.widthMax', { width: limits.maxWidth });
  if (limits.maxHeight !== undefined && height > limits.maxHeight)
    return t('components.pictureUpload.heightMax', { height: limits.maxHeight });
  return '';
});

const cropStyle = computed(() => ({
  height: `${cropRect.height}px`,
  transform: `translate(${cropRect.x}px, ${cropRect.y}px)`,
  width: `${cropRect.width}px`,
}));

watch(
  () => [props.modelValue, props.file] as const,
  async ([visible, file]) => {
    revokeImageUrl();
    if (!visible || !file) return;
    const configuredRatio = props.crop?.aspectRatio;
    selectedCropRatio.value =
      configuredRatio && configuredRatio > 0
        ? configuredRatio
        : (ratioOptions.value[0]?.value ?? null);
    imageUrl.value = URL.createObjectURL(file);
    await nextTick();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  revokeImageUrl();
  removePointerListeners();
});

function revokeImageUrl() {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  imageUrl.value = '';
}

function initializeCrop() {
  const image = imageRef.value;
  if (!image) return;
  imageSize.width = image.clientWidth;
  imageSize.height = image.clientHeight;
  imageSize.naturalWidth = image.naturalWidth;
  imageSize.naturalHeight = image.naturalHeight;

  const padding = Math.min(imageSize.width, imageSize.height) * 0.08;
  const availableWidth = Math.max(32, imageSize.width - padding * 2);
  const availableHeight = Math.max(32, imageSize.height - padding * 2);
  let width = availableWidth;
  let height = availableHeight;
  if (aspectRatio.value) {
    height = width / aspectRatio.value;
    if (height > availableHeight) {
      height = availableHeight;
      width = height * aspectRatio.value;
    }
  }
  Object.assign(cropRect, {
    height,
    width,
    x: (imageSize.width - width) / 2,
    y: (imageSize.height - height) / 2,
  });
}

function selectAspectRatio(value: number | null) {
  if (dimensionAspectRatio.value) return;
  selectedCropRatio.value = value;
  initializeCrop();
}

function isSelectedRatio(value: number | null) {
  if (dimensionAspectRatio.value) {
    return value !== null && value === dimensionAspectRatio.value;
  }
  return selectedCropRatio.value === value;
}

function beginPointer(event: PointerEvent, mode: 'move' | 'resize', corner?: ResizeCorner) {
  event.preventDefault();
  event.stopPropagation();
  pointerOperation = {
    corner,
    mode,
    pointerId: event.pointerId,
    start: { ...cropRect },
    startX: event.clientX,
    startY: event.clientY,
  };
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', endPointer);
  window.addEventListener('pointercancel', endPointer);
}

function handlePointerMove(event: PointerEvent) {
  const operation = pointerOperation;
  if (!operation || event.pointerId !== operation.pointerId) return;
  const dx = event.clientX - operation.startX;
  const dy = event.clientY - operation.startY;
  if (operation.mode === 'move') {
    cropRect.x = clamp(operation.start.x + dx, 0, imageSize.width - operation.start.width);
    cropRect.y = clamp(operation.start.y + dy, 0, imageSize.height - operation.start.height);
    return;
  }
  resizeCrop(operation.start, operation.corner ?? 'se', dx, dy);
}

function resizeCrop(start: CropRect, corner: ResizeCorner, dx: number, dy: number) {
  const minSize = 32;
  const west = corner.includes('w');
  const north = corner.includes('n');
  const anchorX = west ? start.x + start.width : start.x;
  const anchorY = north ? start.y + start.height : start.y;
  const pointerX = (west ? start.x : start.x + start.width) + dx;
  const pointerY = (north ? start.y : start.y + start.height) + dy;

  if (aspectRatio.value) {
    const maxWidth = west ? anchorX : imageSize.width - anchorX;
    const maxHeight = north ? anchorY : imageSize.height - anchorY;
    const desiredWidth = Math.max(
      Math.abs(pointerX - anchorX),
      Math.abs(pointerY - anchorY) * aspectRatio.value,
    );
    const width = clamp(desiredWidth, minSize, Math.min(maxWidth, maxHeight * aspectRatio.value));
    const height = width / aspectRatio.value;
    Object.assign(cropRect, {
      height,
      width,
      x: west ? anchorX - width : anchorX,
      y: north ? anchorY - height : anchorY,
    });
    return;
  }

  const x = west ? clamp(pointerX, 0, anchorX - minSize) : anchorX;
  const y = north ? clamp(pointerY, 0, anchorY - minSize) : anchorY;
  const right = west ? anchorX : clamp(pointerX, anchorX + minSize, imageSize.width);
  const bottom = north ? anchorY : clamp(pointerY, anchorY + minSize, imageSize.height);
  Object.assign(cropRect, { height: bottom - y, width: right - x, x, y });
}

function endPointer(event: PointerEvent) {
  if (pointerOperation && event.pointerId === pointerOperation.pointerId) {
    pointerOperation = undefined;
    removePointerListeners();
  }
}

function removePointerListeners() {
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerup', endPointer);
  window.removeEventListener('pointercancel', endPointer);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function cancel() {
  emit('update:modelValue', false);
  emit('cancel');
}

function handleVisibleChange(value: boolean) {
  if (value) {
    emit('update:modelValue', true);
    return;
  }
  cancel();
}

async function confirm() {
  const image = imageRef.value;
  const source = props.file;
  if (!image || !source || dimensionError.value) return;
  working.value = true;
  try {
    const { height, width } = resultSize.value;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error(t('components.pictureUpload.cropFailed'));
    context.drawImage(
      image,
      (cropRect.x / imageSize.width) * imageSize.naturalWidth,
      (cropRect.y / imageSize.height) * imageSize.naturalHeight,
      (cropRect.width / imageSize.width) * imageSize.naturalWidth,
      (cropRect.height / imageSize.height) * imageSize.naturalHeight,
      0,
      0,
      width,
      height,
    );
    const supportedType = ['image/jpeg', 'image/png', 'image/webp'].includes(source.type)
      ? source.type
      : 'image/png';
    const mimeType = props.crop?.mimeType ?? supportedType;
    const quality = clamp(props.crop?.quality ?? 0.9, 0, 1);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error(t('components.pictureUpload.cropFailed'))),
        mimeType,
        quality,
      );
    });
    const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[mimeType];
    const baseName = source.name.replace(/\.[^.]+$/, '');
    emit(
      'confirm',
      new File([blob], `${baseName}.${extension}`, {
        lastModified: Date.now(),
        type: mimeType,
      }),
    );
    emit('update:modelValue', false);
  } catch (error) {
    ElMessage.error(
      error instanceof Error
        ? error.message
        : t('components.pictureUpload.cropFailed'),
    );
  } finally {
    working.value = false;
  }
}
</script>

<template>
  <ElDialog
    :model-value="modelValue"
    :title="t('components.pictureUpload.cropTitle')"
    width="min(900px, 92vw)"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
    @update:model-value="handleVisibleChange"
  >
    <div class="picture-crop">
      <div class="picture-crop__stage">
        <div v-if="imageUrl" class="picture-crop__image-shell">
          <img ref="imageRef" :src="imageUrl" alt="" @load="initializeCrop" />
          <div
            class="picture-crop__selection"
            :style="cropStyle"
            @pointerdown="beginPointer($event, 'move')"
          >
            <i
              v-for="corner in (['nw', 'ne', 'sw', 'se'] as ResizeCorner[])"
              :key="corner"
              class="picture-crop__handle"
              :class="`is-${corner}`"
              @pointerdown="beginPointer($event, 'resize', corner)"
            ></i>
          </div>
        </div>
      </div>
      <div class="picture-crop__meta">
        <span>{{ t('components.pictureUpload.resultSize') }}：{{ resultSize.width }} × {{ resultSize.height }} px</span>
        <span v-if="aspectRatio">{{ t('components.pictureUpload.aspectRatio') }}：{{ aspectRatio.toFixed(2) }}</span>
      </div>
      <div v-if="ratioOptions.length" class="picture-crop__ratios">
        <span class="picture-crop__ratios-label">
          {{ t('components.pictureUpload.selectAspectRatio') }}
        </span>
        <ElButton
          v-for="option in ratioOptions"
          :key="option.label"
          size="small"
          :type="isSelectedRatio(option.value) ? 'primary' : 'default'"
          :disabled="!!dimensionAspectRatio"
          plain
          @click="selectAspectRatio(option.value)"
        >
          {{ option.label }}
        </ElButton>
      </div>
      <p v-if="dimensionError" class="picture-crop__error">{{ dimensionError }}</p>
      <p v-else class="picture-crop__hint">{{ t('components.pictureUpload.cropHint') }}</p>
    </div>
    <template #footer>
      <ElButton @click="cancel">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" :loading="working" :disabled="!!dimensionError" @click="confirm">
        {{ t('common.confirm') }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<style scoped lang="scss">
.picture-crop__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  padding: 16px;
  overflow: auto;
  background: #171717;
  border-radius: 8px;
}

.picture-crop__image-shell {
  position: relative;
  display: inline-block;
  overflow: hidden;
  line-height: 0;
  user-select: none;
}

.picture-crop__image-shell img {
  display: block;
  max-width: min(760px, 78vw);
  max-height: 58vh;
  pointer-events: none;
}

.picture-crop__selection {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  cursor: move;
  background: rgb(255 255 255 / 4%);
  border: 2px solid #fff;
  box-shadow: 0 0 0 9999px rgb(0 0 0 / 48%);
  touch-action: none;
}

.picture-crop__selection::before,
.picture-crop__selection::after {
  position: absolute;
  content: '';
  pointer-events: none;
}

.picture-crop__selection::before {
  top: 33.33%;
  bottom: 33.33%;
  left: 0;
  right: 0;
  border-top: 1px solid rgb(255 255 255 / 55%);
  border-bottom: 1px solid rgb(255 255 255 / 55%);
}

.picture-crop__selection::after {
  top: 0;
  bottom: 0;
  left: 33.33%;
  right: 33.33%;
  border-right: 1px solid rgb(255 255 255 / 55%);
  border-left: 1px solid rgb(255 255 255 / 55%);
}

.picture-crop__handle {
  position: absolute;
  z-index: 2;
  width: 14px;
  height: 14px;
  background: #fff;
  border: 2px solid var(--el-color-primary);
  border-radius: 50%;
}

.picture-crop__handle.is-nw { top: -8px; left: -8px; cursor: nwse-resize; }
.picture-crop__handle.is-ne { top: -8px; right: -8px; cursor: nesw-resize; }
.picture-crop__handle.is-sw { bottom: -8px; left: -8px; cursor: nesw-resize; }
.picture-crop__handle.is-se { right: -8px; bottom: -8px; cursor: nwse-resize; }

.picture-crop__meta {
  display: flex;
  gap: 18px;
  justify-content: center;
  margin-top: 14px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.picture-crop__ratios {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
}

.picture-crop__ratios-label {
  margin-right: 2px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.picture-crop__hint,
.picture-crop__error {
  margin: 8px 0 0;
  font-size: 13px;
  text-align: center;
}

.picture-crop__hint { color: var(--el-text-color-secondary); }
.picture-crop__error { color: var(--el-color-danger); }
</style>
