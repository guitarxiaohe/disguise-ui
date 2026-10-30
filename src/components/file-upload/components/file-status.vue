<script setup lang="ts">
import type { AttachmentData } from '../file-upload.type';

/**
 * 文件状态组件
 *
 * 封装文件上传的三种状态：加载中、错误、成功
 */
import { h } from 'vue';
import { useI18n } from '@/runtime/i18n';

import { Delete, Download, View } from '@element-plus/icons-vue';
import { ElIcon, ElTooltip } from 'element-plus';

interface Props {
  /** 状态类型 */
  status: 'error' | 'loading' | 'success';
  /** 文件信息 */
  file?: AttachmentData;
  /** 文件名 */
  fileName?: string;
  /** 文件图标类名 */
  iconClass?: string;
  /** 文件图标 SVG */
  iconSvg?: string;
  /** 进度百分比（0-100，仅 loading 状态） */
  progress?: number;
  /** 进度文本（仅 loading 状态） */
  progressText?: string;
  /** 错误信息（仅 error 状态） */
  errorMessage?: string;
  /** 是否显示预览按钮 */
  showPreview?: boolean;
  /** 是否显示下载按钮 */
  showDownload?: boolean;
  /** 是否显示删除按钮 */
  showRemove?: boolean;
  /** 预览回调 */
  onPreview?: (file?: AttachmentData) => void;
  /** 下载回调 */
  onDownload?: (file?: AttachmentData) => void;
  /** 删除回调 */
  onRemove?: (file?: AttachmentData) => void;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  file: undefined,
  fileName: '',
  iconClass: '',
  iconSvg: '',
  progress: 0,
  progressText: '',
  errorMessage: '',
  showPreview: true,
  showDownload: true,
  showRemove: true,
  onPreview: undefined,
  onDownload: undefined,
  onRemove: undefined,
  disabled: false,
});
const { t } = useI18n();

/**
 * 文件操作按钮组件
 */
const FileActions = (componentProps: {
  file?: AttachmentData;
  isError?: boolean;
}) => {
  return h('div', { class: 'file-actions' }, [
    props.showPreview && !componentProps.isError && !props.disabled
      ? h(
          ElTooltip,
          {
            content: t('components.fileUpload.preview'),
            placement: 'top-start',
          },
          {
            default: () =>
              h(
                ElIcon,
                {
                  class: 'file-action-icon',
                  onClick: (e: Event) => {
                    e.stopPropagation();
                    props.onPreview?.(componentProps.file);
                  },
                },
                { default: () => h(View) },
              ),
          },
        )
      : null,
    props.showDownload && !props.disabled
      ? h(
          ElTooltip,
          {
            content: t('components.fileUpload.download'),
            placement: 'top-start',
          },
          {
            default: () =>
              h(
                ElIcon,
                {
                  class: 'file-action-icon',
                  onClick: (e: Event) => {
                    e.stopPropagation();
                    props.onDownload?.(componentProps.file);
                  },
                },
                { default: () => h(Download) },
              ),
          },
        )
      : null,
    props.showRemove && !props.disabled
      ? h(
          ElTooltip,
          {
            content: t('components.fileUpload.remove'),
            placement: 'top-start',
          },
          {
            default: () =>
              h(
                ElIcon,
                {
                  class: 'file-action-icon',
                  onClick: (e: Event) => {
                    e.stopPropagation();
                    props.onRemove?.(componentProps.file);
                  },
                },
                { default: () => h(Delete) },
              ),
          },
        )
      : null,
  ]);
};
</script>

<template>
  <!-- 加载中状态 -->
  <div v-if="status === 'loading'" class="upload-loading">
    <div class="file-info">
      <div class="file-icon-wrapper">
        <img :src="iconSvg" class="file-icon" alt="" />
      </div>
      <div class="file-details">
        <div class="file-name">
          {{ fileName || t('components.fileUpload.unknownFile') }}
        </div>
        <div class="file-size">{{ progressText || '0' }}</div>
      </div>
    </div>
    <div class="upload-progress-bar">
      <div
        class="upload-progress-fill"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
  </div>

  <!-- 错误状态 -->
  <div
    v-else-if="status === 'error'"
    class="file-container file-container--error"
  >
    <div class="file-info">
      <div class="file-icon-wrapper file-icon-wrapper--error">
        <img :src="iconSvg" class="file-icon" alt="" />
      </div>
      <div class="file-details">
        <div class="file-name">{{ fileName }}</div>
        <div class="file-error-text">
          {{ t('components.fileUpload.error') }}
        </div>
      </div>
    </div>

    <component :is="FileActions" :file="file" :is-error="true" />

    <div v-if="errorMessage" class="file-error-message">
      {{ errorMessage }}
    </div>
  </div>

  <!-- 成功状态 -->
  <div v-else class="file-container">
    <div class="file-info">
      <div class="file-icon-wrapper">
        <img :src="iconSvg" class="file-icon" alt="" />
      </div>
      <div class="file-details">
        <div class="file-name">{{ fileName }}</div>
      </div>
    </div>

    <component :is="FileActions" :file="file" />
  </div>
</template>

<style scoped lang="scss">
// 文件信息（公共样式）
.file-info {
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

// 文件图标包装器（公共样式）
.file-icon-wrapper {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #fff;
  border-radius: 4px;

  // 文件类型背景色
  &.file-icon--pdf {
    background-color: #dc3545;
  }

  &.file-icon--word {
    background-color: #2b579a;
  }

  &.file-icon--excel {
    background-color: #1d6f42;
  }

  &.file-icon--powerpoint {
    background-color: #d04423;
  }

  &.file-icon--image {
    background-color: #4caf50;
  }

  &.file-icon--video {
    background-color: #ff5722;
  }

  &.file-icon--audio {
    background-color: #9c27b0;
  }

  &.file-icon--archive {
    background-color: #ff9800;
  }

  &.file-icon--text {
    background-color: #607d8b;
  }

  &.file-icon--code {
    background-color: #2196f3;
  }

  &.file-icon--default {
    background-color: #f0f0f0;
  }

  // 错误状态
  &--error {
    background-color: #fff;
    border: 1px solid #f56c6c;
  }

  .file-icon {
    color: #fff;
  }

  &.file-icon--default .file-icon {
    color: var(--el-text-color-primary);
  }

  &--error .file-icon {
    color: #f56c6c;
  }
}

// 文件详情（公共样式）
.file-details {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  .file-name {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }

  .file-size {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .file-error-text {
    font-size: 12px;
    font-weight: 500;
    color: #f56c6c;
  }
}

// 文件操作按钮（公共样式）
.file-actions {
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  align-items: center;
  margin-left: 12px;

  .file-action-icon {
    font-size: 18px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    transition: color var(--el-transition-duration-fast);

    &:hover {
      color: var(--el-color-primary);
    }
  }
}

// 进度条（公共样式）
.upload-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  overflow: hidden;
  background-color: #e4e7ed;
}

.upload-progress-fill {
  height: 100%;
  background-color: #1f58e9;
  transition: width 0.3s ease;
}

// 加载状态
.upload-loading {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;

  .file-name {
    height: 25px;
    line-height: 25px;
  }

  .file-size {
    height: 25px;
    line-height: 25px;
  }
}

// 文件容器
.file-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 60px;
  background-color: #fff;

  &--error {
    flex-direction: column;
    align-items: flex-start;

    .file-info {
      width: 100%;
    }

    .file-actions {
      position: absolute;
      top: 12px;
      right: 16px;
    }

    .file-error-message {
      width: 100%;
      height: 16px;
      padding-left: 44px;
      font-size: 12px;
      line-height: 16px;
      color: #f56c6c;
    }
  }
}
</style>
