import type { AttachmentData } from '../file-upload/file-upload.type';

export interface PictureCropOptions {
  /** 是否在上传前打开裁剪窗口 */
  enabled?: boolean;
  /** 固定裁剪框宽高比；不传时可自由调整宽高 */
  aspectRatio?: number;
  /** 可在裁剪窗口中切换的宽高比；value 为 null 表示自由比例 */
  aspectRatios?: PictureCropAspectRatioOption[];
  /** 裁剪结果格式；默认沿用原图支持的格式 */
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
  /** JPEG/WebP 输出质量，范围 0～1，默认 0.9 */
  quality?: number;
}

export interface PictureCropAspectRatioOption {
  /** 展示名称，例如“自由”、“1:1”、“16:9” */
  label: string;
  /** 宽除以高；null 表示自由比例 */
  value: number | null;
}

export interface PictureDimensionOptions {
  /** 最终图片必须等于此宽度（px） */
  width?: number;
  /** 最终图片必须等于此高度（px） */
  height?: number;
  /** 最终图片最小宽度（px） */
  minWidth?: number;
  /** 最终图片最小高度（px） */
  minHeight?: number;
  /** 最终图片最大宽度（px） */
  maxWidth?: number;
  /** 最终图片最大高度（px） */
  maxHeight?: number;
}

export interface PictureUploadProps {
  modelValue?: AttachmentData | AttachmentData[] | string | string[];
  disabled?: boolean;
  /** 最终上传文件大小上限（MB） */
  maxSize?: number;
  accept?: string[];
  width?: number;
  height?: number;
  showPreview?: boolean;
  showDownload?: boolean;
  showRemove?: boolean;
  selected?: boolean;
  errorMessage?: string;
  /** OSS 保存目录，相对 attachment/v3 */
  baseFolder?: string;
  /** 是否给图片加中心水印 */
  addWatermark?: boolean;
  /** 最大图片数量，大于 1 时启用多图模式 */
  maxCount?: number;
  /** 上传前裁剪配置 */
  crop?: PictureCropOptions;
  /** 裁剪后（未开启裁剪时为原图）的像素尺寸限制 */
  dimensions?: PictureDimensionOptions;
}

export interface PictureUploadEmits {
  (
    e: 'update:modelValue',
    value: AttachmentData | AttachmentData[] | string | string[] | undefined,
  ): void;
  (e: 'uploadSuccess', file: AttachmentData): void;
  (e: 'uploadError', error: Error): void;
  (e: 'remove', file: AttachmentData): void;
  (e: 'preview', file: AttachmentData): void;
  (e: 'download', file: AttachmentData): void;
}
