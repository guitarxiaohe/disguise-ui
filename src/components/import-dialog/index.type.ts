/** ****************************** 基础类型 ********************************/

// 导入模式值
export type ImportDialogMode = 'create' | 'update' | (string & {});

// 导入流程步骤
export type ImportDialogStep = 'importing' | 'mapping' | 'preview' | 'upload';

/** ****************************** 组件数据 ********************************/

// 导入方式选项
export interface ImportDialogModeOption {
  label: string;
  value: ImportDialogMode;
  disabled?: boolean;
}

// sheet 选项
export interface ImportDialogSheetOption {
  label: string;
  value: string;
}

// 预览表格列定义
export interface ImportDialogPreviewColumn {
  prop: string;
  label: string;
  width?: number | string;
  minWidth?: number | string;
}

// 目标字段定义
export interface ImportDialogTargetField {
  field: string;
  label: string;
  required?: boolean;
  allowDuplicateCheck?: boolean;
}

// 字段映射项
export interface ImportDialogMappingItem {
  targetField: string;
  targetLabel: string;
  sourceColumn: string;
  required?: boolean;
  duplicateCheck: boolean;
  allowDuplicateCheck?: boolean;
}

// 解析文件入参
export interface ImportDialogParsePayload {
  file: File;
  mode: ImportDialogMode;
  sheet?: string;
}

// 解析文件返回
export interface ImportDialogParseResult {
  fileName?: string;
  total: number;
  sheets: ImportDialogSheetOption[];
  currentSheet?: string;
  previewColumns: ImportDialogPreviewColumn[];
  previewRows: Record<string, unknown>[];
  mappings?: ImportDialogMappingItem[];
}

// 提交导入入参
export interface ImportDialogSubmitPayload {
  file: File;
  mode: ImportDialogMode;
  sheet: string;
  mappings: ImportDialogMappingItem[];
  onProgress?: (progress: number, message?: string) => void;
}

// 提交导入结果
export interface ImportDialogSubmitResult {
  success: boolean;
  title?: string;
  description?: string;
  detail?: string;
  successCount?: number;
  failureCount?: number;
}

/** ****************************** 组件协议 ********************************/

/** 导入弹窗的接口地址配置，可同时配置上传接口和模板下载接口。 */
export interface ImportDialogUrlConfig {
  /** 上传导入接口 */
  api?: string;
  /** 模板下载接口 */
  templateUrl?: string;
  /** 模板下载请求方法，默认 GET */
  templateMethod?: 'GET' | 'POST';
}

// 组件 Props
export interface ImportDialogProps {
  modelValue: boolean;
  /** 直接上传导入接口，传入后组件内部负责提交文件 */
  api?: string;
  /** 下载导入模板接口，传入后组件内部负责下载文件 */
  templateUrl?: string;
  /** 下载导入模板请求方法，默认 GET */
  templateMethod?: 'GET' | 'POST';
  title?: string;
  defaultMode?: ImportDialogMode;
  modes?: ImportDialogModeOption[];
  accept?: string[];
  maxSize?: number;
  maxPreviewCount?: number;
  tips?: string[];
  targetFields?: ImportDialogTargetField[];
  parseFile?: (
    payload: ImportDialogParsePayload,
  ) => Promise<ImportDialogParseResult>;
  submitImport?: (
    payload: ImportDialogSubmitPayload,
  ) => Promise<ImportDialogSubmitResult>;
  resetOnClose?: boolean;

  templateName?: string;
}

// 组件 Emits
export interface ImportDialogEmits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'downloadTemplate'): void;
  (e: 'fileChange', file: File | null): void;
  (e: 'success', result: ImportDialogSubmitResult): void;
  (e: 'error', result: Error | ImportDialogSubmitResult): void;
  (e: 'cancel'): void;
}
