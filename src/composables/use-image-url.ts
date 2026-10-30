import { getImageBaseUrl } from '@/runtime/context';

/**
 * 把相对路径拼成可访问的图片地址。域名由 setupDisguise 的 imageBaseUrl 决定。
 */
export const useImageUrl = () => {
  function resolveImageUrl(path?: unknown) {
    const raw = String(path ?? '').trim();
    if (!raw) return '';

    // 已经是完整 URL / base64 / blob,原样返回
    if (/^(https?:\/\/|data:|blob:)/i.test(raw)) {
      return raw;
    }

    const base = getImageBaseUrl().replace(/\/+$/, '');
    const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`;
    return base ? `${base}${normalizedPath}` : normalizedPath;
  }

  return {
    ensureImageBaseUrl: getImageBaseUrl,
    resolveImageUrl,
  };
};
