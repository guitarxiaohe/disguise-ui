import type { UploadFileOptions, UploadFileResult } from './context';

import { getFileUploader } from './context';

/**
 * 上传单个文件。具体接口由 setupDisguise 的 uploadFile 提供。
 */
export async function uploadFileApi(
  file: File,
  options?: UploadFileOptions,
): Promise<UploadFileResult> {
  const uploadFile = getFileUploader();
  if (!uploadFile) {
    throw new Error('请先调用 setupDisguise，并传入 uploadFile');
  }
  return uploadFile(file, options);
}
