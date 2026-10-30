<script setup lang="ts">
import type { AttachmentData } from '@/components/file-upload/file-upload.type';

import { computed } from 'vue';

import { useFileType } from '@/components/file-upload/composables/use-file-type';
import { useImageUrl } from '@/composables/use-image-url';
import { ElTooltip } from 'element-plus';

import PictureCell from './picture-cell.vue';

/**
 * 附件 / 文件类型单元格组件
 *
 * 功能：
 * - 显示文件类型图标（视觉风格对齐 file-upload）
 * - 悬停图标显示浮层预览（PDF 用 iframe，其他显示文件信息）
 * - 点击图标打开 / 预览文件
 * - 支持多个文件，只展示前 N 个，超出显示「+X」
 */

interface Props {
  attachments?: AttachmentData | AttachmentData[] | null;
  maxPreviewCount?: number;
}

interface FileItem {
  fileUrl: string;
  fileOriginName: string;
  fileSuffix: string;
  size?: null | number;
  iconClass: string;
  iconSvg: string;
  kind: 'doc' | 'other' | 'pdf' | 'xlsx';
  kindLabel: string;
}

const props = withDefaults(defineProps<Props>(), {
  attachments: null,
  maxPreviewCount: 3,
});
const { ensureImageBaseUrl, resolveImageUrl } = useImageUrl();
void ensureImageBaseUrl();

const buildFullUrl = (fileUrl: string | undefined): string =>
  resolveImageUrl(fileUrl || '');

const getFileNameFromUrl = (fileUrl: string): string => {
  try {
    const cleanUrl = fileUrl.split('?')[0]?.split('#')[0] ?? '';
    const segments = cleanUrl.split('/');
    const last = segments[segments.length - 1] || '';
    return decodeURIComponent(last || 'file');
  } catch {
    return 'file';
  }
};

const toSafeString = (val: unknown): string =>
  typeof val === 'string' ? val : '';

const isImageAttachment = (attachment: AttachmentData): boolean => {
  const mime = toSafeString(attachment.fileSuffix).toLowerCase();
  if (mime.startsWith('image/')) return true;

  const raw = (
    toSafeString(attachment.fileUrl) ||
    toSafeString(attachment.fileOriginName) ||
    ''
  ).toLowerCase();
  return (
    raw.endsWith('.jpg') ||
    raw.endsWith('.jpeg') ||
    raw.endsWith('.png') ||
    raw.endsWith('.gif') ||
    raw.endsWith('.bmp') ||
    raw.endsWith('.webp') ||
    raw.endsWith('.svg') ||
    raw.endsWith('.ico')
  );
};

/**
 * 根据文件名 / MIME 判断文件大类
 */
const getFileKind = (
  fileName: string,
  mime: string,
): { kind: FileItem['kind']; label: string } => {
  const name = (fileName || '').toLowerCase();
  const m = (mime || '').toLowerCase();
  if (m === 'application/pdf' || name.endsWith('.pdf')) {
    return { kind: 'pdf', label: 'PDF' };
  }
  if (
    m.includes('spreadsheet') ||
    m.includes('excel') ||
    m === 'application/vnd.ms-excel' ||
    name.endsWith('.xlsx') ||
    name.endsWith('.xls') ||
    name.endsWith('.csv')
  ) {
    return { kind: 'xlsx', label: 'Excel' };
  }
  if (
    m.includes('word') ||
    m === 'application/msword' ||
    name.endsWith('.doc') ||
    name.endsWith('.docx')
  ) {
    return { kind: 'doc', label: 'Word' };
  }
  return { kind: 'other', label: '文件' };
};

const attachmentList = computed<AttachmentData[]>(() =>
  props.attachments
    ? Array.isArray(props.attachments)
      ? props.attachments
      : [props.attachments]
    : [],
);

const imageUrls = computed(() =>
  attachmentList.value
    .filter((item) => item && isImageAttachment(item))
    .map((item) => buildFullUrl(item.fileUrl || item.fileOriginName || ''))
    .filter((fileUrl) => !!fileUrl),
);

const allFiles = computed<FileItem[]>(() =>
  attachmentList.value
    .filter(
      (item) =>
        item &&
        !isImageAttachment(item) &&
        (item.fileUrl || item.fileOriginName),
    )
    .map((item) => {
      const rawUrl = item.fileUrl || item.fileOriginName || '';
      const fileUrl = buildFullUrl(rawUrl);
      const fileOriginName = item.fileOriginName || getFileNameFromUrl(rawUrl);
      const fileType = useFileType(fileOriginName, item.fileSuffix);
      const { kind, label } = getFileKind(
        fileOriginName,
        toSafeString(item.fileSuffix),
      );
      return {
        fileUrl,
        fileOriginName,
        fileSuffix: toSafeString(item.fileSuffix),
        size: item.size ?? null,
        iconClass: fileType.iconClass.value,
        iconSvg: fileType.iconSvg.value,
        kind,
        kindLabel: label,
      };
    }),
);

const displayFiles = computed(() =>
  allFiles.value.slice(0, props.maxPreviewCount),
);
const extraCount = computed(() =>
  Math.max(0, allFiles.value.length - displayFiles.value.length),
);

/**
 * 点击文件：
 * - PDF / 图片：新窗口打开（浏览器原生预览）
 * - 其他：新窗口打开 / 下载
 */
const handleDownload = (file: FileItem) => {
  if (!file.fileUrl) return;
  window.open(file.fileUrl, '_blank');
};

/**
 * 格式化文件大小
 */
const formatSize = (size?: null | number): string => {
  if (!size || size <= 0) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};
</script>

<template>
  <div class="file-cell flex items-center">
    <template v-if="imageUrls.length > 0 || displayFiles.length > 0">
      <div class="file-cell__list">
        <!-- 图片附件：PictureCell 已实现悬停 + 点击切换预览 -->
        <PictureCell
          v-if="imageUrls.length > 0"
          :urls="imageUrls"
          :max-preview-count="maxPreviewCount"
          :size="26"
          :image-list-props="{}"
        />

        <!-- 非图片附件：悬停浮层预览 + 点击打开 -->
        <ElTooltip
          v-for="file in displayFiles"
          :key="file.fileUrl"
          placement="top"
          effect="light"
          :show-after="100"
          :teleported="true"
          :z-index="3000"
        >
          <template #content>
            <!-- PDF：iframe 预览 -->
            <iframe
              v-if="file.kind === 'pdf'"
              :src="file.fileUrl"
              style="display: block; width: 380px; height: 500px; border: none"
            ></iframe>
            <!-- 其他：文件信息卡片 -->
            <div
              v-else
              style="
                min-width: 200px;
                max-width: 280px;
                padding: 4px 8px;
                font-size: 13px;
                line-height: 1.6;
              "
            >
              <div style="font-weight: 600; word-break: break-all">
                {{ file.fileOriginName }}
              </div>
              <div style="color: #909399">类型：{{ file.kindLabel }}</div>
              <div v-if="formatSize(file.size)" style="color: #909399">
                大小：{{ formatSize(file.size) }}
              </div>
              <div style="color: #909399">点击打开 / 下载</div>
            </div>
          </template>

          <div class="file-cell__item" @click.stop="handleDownload(file)">
            <div class="file-icon-wrapper">
              <img
                v-if="file.iconSvg"
                :src="file.iconSvg"
                alt=""
                class="file-icon"
              />
            </div>
          </div>
        </ElTooltip>

        <span v-if="extraCount > 0" class="file-cell__extra">
          +{{ extraCount }}
        </span>
      </div>
    </template>
    <span v-else>-</span>
  </div>
</template>

<style scoped lang="scss">
.file-cell {
  height: 100%;
}

.file-cell__list {
  display: flex;
  gap: 4px;
  align-items: center;
}

.file-cell__item {
  width: 28px;
  height: 28px;
  cursor: pointer;
}

.file-cell__extra {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 12px;
  color: #606266;
  background-color: #f2f3f5;
  border-radius: 4px;
}

.file-icon-wrapper {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.file-icon {
  width: 26px;
  height: 26px;
}
</style>
