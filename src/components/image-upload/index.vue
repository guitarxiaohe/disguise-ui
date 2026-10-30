<script setup lang="ts">
import type { UploadRawFile, UploadRequestOptions } from 'element-plus';

import { computed, ref } from 'vue';

import { useImageUrl } from '@/composables/use-image-url';
import { Delete, Loading, Plus, ZoomIn } from '@element-plus/icons-vue';
import { ElIcon, ElImageViewer, ElMessage, ElUpload } from 'element-plus';

import { uploadFileApi } from '@/runtime/upload';
import { $t } from '@/runtime/i18n';

const props = withDefaults(
  defineProps<{
    /** 允许的 MIME 类型，如 image/png */
    accept?: string[];
    disabled?: boolean;
    height?: number;
    /** 单位 MB */
    maxSize?: number;
    width?: number;
  }>(),
  {
    accept: () => ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
    disabled: false,
    height: 96,
    maxSize: 5,
    width: 96,
  },
);

const model = defineModel<string>({ default: '' });

const { resolveImageUrl } = useImageUrl();
const uploading = ref(false);
const previewVisible = ref(false);

const imageSrc = computed(() => resolveImageUrl(model.value));
const boxStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
}));

function beforeUpload(file: UploadRawFile) {
  if (props.accept.length > 0 && !props.accept.includes(file.type)) {
    const types = props.accept
      .map((type) => type.replace('image/', '').replace('+xml', ''))
      .join(' / ')
      .toUpperCase();
    ElMessage.error($t('components.imageUpload.typeNotAllowed', { types }));
    return false;
  }
  if (file.size / 1024 / 1024 > props.maxSize) {
    ElMessage.error(
      $t('components.imageUpload.sizeLimitExceeded', { size: props.maxSize }),
    );
    return false;
  }
  return true;
}

async function upload(options: UploadRequestOptions) {
  uploading.value = true;
  try {
    const { url } = await uploadFileApi(options.file);
    model.value = url;
  } finally {
    uploading.value = false;
  }
}

function remove() {
  model.value = '';
}
</script>

<template>
  <div class="image-upload" :class="{ 'is-disabled': disabled }">
    <div v-if="imageSrc" class="image-upload__box" :style="boxStyle">
      <img :src="imageSrc" alt="" class="image-upload__img" />
      <div class="image-upload__mask">
        <ElIcon
          class="image-upload__action"
          :title="$t('components.imageUpload.preview')"
          @click="previewVisible = true"
        >
          <ZoomIn />
        </ElIcon>
        <ElIcon
          v-if="!disabled"
          class="image-upload__action"
          :title="$t('components.imageUpload.remove')"
          @click="remove"
        >
          <Delete />
        </ElIcon>
      </div>
    </div>

    <ElUpload
      v-else
      :accept="accept.join(',')"
      :before-upload="beforeUpload"
      :disabled="disabled || uploading"
      :http-request="upload"
      :show-file-list="false"
    >
      <div class="image-upload__box is-empty" :style="boxStyle">
        <ElIcon class="image-upload__icon" :class="{ 'is-loading': uploading }">
          <Loading v-if="uploading" />
          <Plus v-else />
        </ElIcon>
        <span class="image-upload__text">
          {{
            uploading
              ? $t('components.imageUpload.uploading')
              : $t('components.imageUpload.upload')
          }}
        </span>
      </div>
    </ElUpload>

    <ElImageViewer
      v-if="previewVisible"
      :url-list="[imageSrc]"
      teleported
      @close="previewVisible = false"
    />
  </div>
</template>

<style scoped>
.image-upload {
  display: inline-flex;
}

.image-upload__box {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition: border-color 0.15s;
}

.image-upload__box.is-empty {
  cursor: pointer;
  border-color: var(--el-border-color);
  border-style: dashed;
}

.image-upload__box.is-empty:hover {
  border-color: var(--el-color-primary);
}

.image-upload.is-disabled .image-upload__box.is-empty {
  cursor: not-allowed;
}

.image-upload__img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-upload__mask {
  position: absolute;
  inset: 0;
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 45%);
  opacity: 0;
  transition: opacity 0.15s;
}

.image-upload__box:hover .image-upload__mask {
  opacity: 1;
}

.image-upload__action {
  font-size: 18px;
  color: #fff;
  cursor: pointer;
}

.image-upload__icon {
  font-size: 20px;
  color: var(--el-text-color-secondary);
}

.image-upload__text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
