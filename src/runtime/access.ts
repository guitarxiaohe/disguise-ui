import { getAccessChecker, getAccessToken } from './context';

/******************************** 权限 ********************************/

/**
 * 判断按钮权限码。未注入时默认放行。
 */
export function useAccess() {
  return {
    hasAccessByCodes(codes: string[]) {
      return getAccessChecker().value(codes);
    },
  };
}

/**
 * 导出时读取访问令牌。
 */
export function useAccessStore() {
  return {
    get accessToken() {
      return getAccessToken();
    },
  };
}
