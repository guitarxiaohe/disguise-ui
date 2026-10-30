import type { AttachmentData } from '../file-upload.type';

/** ****************************** 单文件上传状态工具 ********************************/

interface ResolvePendingFileDataOptions {
  incomingValue: AttachmentData | string | undefined;
  pendingFileData: AttachmentData | null;
  isUploading: boolean;
}

function attachmentUrls(file?: AttachmentData | null) {
  return [file?.url, file?.fileUrl]
    .map((item) => String(item ?? '').trim())
    .filter(Boolean);
}

// 根据外部 v-model 的变化决定是否保留本次上传生成的附件元信息
export function resolvePendingFileData(
  options: ResolvePendingFileDataOptions,
): AttachmentData | null {
  const { incomingValue, pendingFileData, isUploading } = options;

  if (!incomingValue) {
    return isUploading ? pendingFileData : null;
  }

  if (typeof incomingValue !== 'string') {
    return null;
  }

  if (!pendingFileData) {
    return null;
  }

  return attachmentUrls(pendingFileData).includes(incomingValue.trim())
    ? pendingFileData
    : null;
}
