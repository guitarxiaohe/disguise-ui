import { getRequestClient } from './context';

/******************************** 请求 ********************************/

export interface RequestResponse<T> {
  data: T;
  headers: {
    get?: (name: string) => null | string;
    [key: string]: unknown;
  };
}

export interface DisguiseRequestClient {
  getBaseUrl: () => string;
  download: <T>(url: string, config?: Record<string, unknown>) => Promise<T>;
  upload: <T>(
    url: string,
    data?: Record<string, unknown>,
    config?: Record<string, unknown>,
  ) => Promise<T>;
}

function requireRequestClient() {
  const client = getRequestClient();
  if (!client) {
    throw new Error('请先调用 setupDisguise，并传入 request');
  }
  return client;
}

/** 导入、导出组件使用的请求入口 */
export const requestClient = {
  getBaseUrl() {
    return getRequestClient()?.getBaseUrl() ?? '';
  },
  download<T>(url: string, config?: Record<string, unknown>) {
    return requireRequestClient().download<T>(url, config);
  },
  upload<T>(
    url: string,
    data?: Record<string, unknown>,
    config?: Record<string, unknown>,
  ) {
    return requireRequestClient().upload<T>(url, data, config);
  },
};
