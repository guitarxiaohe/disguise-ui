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
  const result = await uploadFileApi(file, {
    ...options,
    onProgress,
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
