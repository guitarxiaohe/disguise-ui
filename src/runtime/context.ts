import { ref } from 'vue';

import type { DictValueItem } from './dict';
import type { DisguiseRequestClient } from './request';

/******************************** 宿主配置 ********************************/

export interface UploadFileOptions {
  /** OSS 保存目录，相对 attachment/v3 */
  baseFolder?: string;
  /** 是否给图片加中心水印 */
  addWatermark?: boolean;
  /** 上传进度 0-100 */
  onProgress?: (percent: number) => void;
}

export interface UploadFileResult {
  url: string;
  cache_url?: string;
}

export interface DisguiseOptions {
  /** 组件内置文案语言，默认 zh-CN */
  locale?: string;
  /** 覆盖内置文案，key 路径与组件里的 t() 一致 */
  messages?: Record<string, Record<string, unknown>>;
  /** 导入、导出使用的请求客户端 */
  request?: DisguiseRequestClient;
  /** 按字典编码返回字典项。不传时字典标签显示原始值 */
  fetchAllDictData?: () => Promise<Record<string, DictValueItem[]>>;
  /** 图片和附件上传 */
  uploadFile?: (
    file: File,
    options?: UploadFileOptions,
  ) => Promise<UploadFileResult>;
  /** 相对图片路径要拼接的域名 */
  imageBaseUrl?: string;
  /** 返回 false 时隐藏对应权限按钮。不传时全部显示 */
  hasAccess?: (codes: string[]) => boolean;
  /** 导出请求附带的 token */
  getAccessToken?: () => string;
  /** BaseCard 阴影 */
  cardShadow?: 'always' | 'hover' | 'never';
}

const locale = ref('zh-CN');
const messages = ref<Record<string, Record<string, unknown>>>({});
const accessChecker = ref<(codes: string[]) => boolean>(() => true);
const accessTokenReader = ref<() => string>(() => '');
const cardShadow = ref<'always' | 'hover' | 'never'>('hover');

let requestClient: DisguiseRequestClient | null = null;
let dictLoader: DisguiseOptions['fetchAllDictData'];
let fileUploader: DisguiseOptions['uploadFile'];
let imageBaseUrl = '';

/**
 * 写入组件运行时需要的请求、上传、字典和文案。
 */
export function configureDisguise(options: DisguiseOptions) {
  if (options.locale) locale.value = options.locale;
  if (options.messages) messages.value = options.messages;
  if (options.request) requestClient = options.request;
  if (options.fetchAllDictData) dictLoader = options.fetchAllDictData;
  if (options.uploadFile) fileUploader = options.uploadFile;
  if (options.imageBaseUrl !== undefined) imageBaseUrl = options.imageBaseUrl;
  if (options.hasAccess) accessChecker.value = options.hasAccess;
  if (options.getAccessToken) accessTokenReader.value = options.getAccessToken;
  if (options.cardShadow) cardShadow.value = options.cardShadow;
}

export function getLocale() {
  return locale;
}

export function getExtraMessages() {
  return messages;
}

export function getRequestClient() {
  return requestClient;
}

export function loadDictData() {
  return dictLoader?.() ?? Promise.resolve({});
}

export function getFileUploader() {
  return fileUploader;
}

export function getImageBaseUrl() {
  return imageBaseUrl;
}

export function getAccessChecker() {
  return accessChecker;
}

export function getAccessToken() {
  return accessTokenReader.value();
}

export function getCardShadow() {
  return cardShadow;
}
