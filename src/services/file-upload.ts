import type { AttachmentData } from '@/components/file-upload/file-upload.type';

import { uploadFileApi } from '@/runtime/upload';

export interface UploadFileParams {
  /** OSS 保存目录，相对 attachment/v3 */
  baseFolder?: string;
  /** 是否给图片加中心水印 */
  addWatermark?: boolean;
}

/**
 * 上传文件并转成附件数据，供上传组件使用。
 */
export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void,
  options?: UploadFileParams,
): Promise<AttachmentData> {
  onProgress?.(0);
  // 文件传输完成不等于后端已经处理成功。接口 Promise 返回前最多展示 99%，
  // 避免进度条先到 100% 后仍在等待后端响应。
  const handleUploadingProgress = (percent: number) => {
    const normalizedPercent = Number.isFinite(percent)
      ? Math.round(percent)
      : 0;
    onProgress?.(Math.max(0, Math.min(99, normalizedPercent)));
  };
  const result = await uploadFileApi(file, {
    ...options,
    onProgress: handleUploadingProgress,
  });
  onProgress?.(100);

  return {
    name: file.name,
    fileOriginName: file.name,
    type: file.type,
    size: file.size,
    fileSizeInfo: file.size,
    url: result.url,
    fileUrl: result.cache_url || result.url,
  };
}
