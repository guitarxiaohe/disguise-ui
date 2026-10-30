import type { DisguiseOptions } from './runtime/context';

import { configureDisguise } from './runtime/context';

/**
 * 在应用启动时注入请求、上传、字典、权限和文案。
 * 组件不直接依赖具体后台，这些能力都从这里进入。
 */
export function setupDisguise(options: DisguiseOptions = {}) {
  configureDisguise(options);
}

export type { DisguiseOptions } from './runtime/context';
