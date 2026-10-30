import type { Recordable } from './types';

import { getExtraMessages, getLocale } from './context';
import enCommon from '../locales/en-US/common.json';
import enComponents from '../locales/en-US/components.json';
import enSchemaForm from '../locales/en-US/schemaForm.json';
import enTranslation from '../locales/en-US/translation.json';
import enValidation from '../locales/en-US/validation.json';
import zhCommon from '../locales/zh-CN/common.json';
import zhComponents from '../locales/zh-CN/components.json';
import zhSchemaForm from '../locales/zh-CN/schemaForm.json';
import zhTranslation from '../locales/zh-CN/translation.json';
import zhValidation from '../locales/zh-CN/validation.json';

/******************************** 文案 ********************************/

type MessageTree = Record<string, unknown>;

function componentMessages(raw: MessageTree) {
  const messages = { ...raw };
  const nested = raw.components;
  if (
    nested &&
    typeof nested === 'object' &&
    'userAvatarInfo' in nested &&
    !messages.userAvatarInfo
  ) {
    messages.userAvatarInfo = nested.userAvatarInfo;
  }
  return messages;
}

function createLocaleMessages(
  components: MessageTree,
  schemaForm: MessageTree,
  validation: MessageTree,
  common: MessageTree,
  translation: MessageTree,
) {
  return {
    components: componentMessages(components),
    schemaForm,
    validation,
    common,
    'product-management': {
      attribute: {
        translation,
      },
    },
  };
}

const builtin: Record<string, MessageTree> = {
  'zh-CN': createLocaleMessages(
    zhComponents,
    zhSchemaForm,
    zhValidation,
    zhCommon,
    zhTranslation,
  ),
  'en-US': createLocaleMessages(
    enComponents,
    enSchemaForm,
    enValidation,
    enCommon,
    enTranslation,
  ),
};

function readPath(source: unknown, key: string) {
  return key.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as MessageTree)[part];
  }, source);
}

function fillParams(template: string, params?: Recordable) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    params[name] === undefined ? '' : String(params[name]),
  );
}

function lookup(key: string) {
  const languages = [getLocale().value, 'zh-CN'];
  for (const language of languages) {
    const extra = readPath(getExtraMessages().value[language], key);
    if (typeof extra === 'string') return extra;
    const builtIn = readPath(builtin[language], key);
    if (typeof builtIn === 'string') return builtIn;
  }
  return key;
}

/**
 * 读取组件文案。宿主可通过 setupDisguise 覆盖。
 */
export function t(key: string, params?: Recordable) {
  return fillParams(lookup(key), params);
}

export const $t = t;

/**
 * 给仍调用 useI18n 的上传组件提供同一套文案。
 */
export function useI18n() {
  return { t };
}
