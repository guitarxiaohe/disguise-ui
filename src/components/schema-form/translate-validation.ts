import type { FormItemRule } from 'element-plus';

import type {
  FieldContext,
  ResolvedField,
  TranslateLanguageValues,
} from './schema-form.type';

import AsyncValidator from 'async-validator';

import { getTranslateLanguages } from '@/runtime/context';

import { DEFAULT_TRANSLATE_LANGUAGES } from './schema-form.type';
import {
  evalCondition,
  resolvePlaceholder,
  resolveRules,
} from './schema-form.util';

export type TranslateErrors = Record<string, string>;

export function translateLanguages(field: ResolvedField) {
  const fieldLanguages = field.translateConfig?.language;
  if (fieldLanguages?.length) return fieldLanguages;
  const globalLanguages = getTranslateLanguages().value;
  return globalLanguages.length ? globalLanguages : DEFAULT_TRANSLATE_LANGUAGES;
}

export function translateValues(
  value: unknown,
  firstLanguage: string,
): TranslateLanguageValues {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as TranslateLanguageValues;
  }
  return typeof value === 'string' ? { [firstLanguage]: value } : {};
}

function hasContent(value: unknown, richText: boolean): boolean {
  if (typeof value === 'string') {
    if (richText) {
      // 空段落、换行和不换行空格不算富文本内容；图片等非文字内容仍有效。
      if (/<(?:img|video|audio|iframe|hr)\b/i.test(value)) return true;
      value = value
        .replace(/<[^>]*>/g, '')
        .replace(/&(?:nbsp|#160|#x0*a0);/gi, ' ');
    }
    return (value as string).trim().length > 0;
  }
  return typeof value === 'number' || typeof value === 'boolean';
}

/** 保留字段级 prop，让原有校验失败滚动定位和表单公开方法继续生效。 */
export function resolveTranslateRules(
  field: ResolvedField,
  context: FieldContext,
  report: (errors: TranslateErrors) => void,
): FormItemRule[] {
  const required = evalCondition(field.required, context);
  const rules = resolveRules({ ...field, required: false }, context);
  if (required) {
    rules.unshift({
      validator: (_rule, value) =>
        hasContent(value, field.type === 'rich-text') ||
        new Error(resolvePlaceholder(field)),
    });
  }
  if (rules.length === 0) return [];

  let revision = 0;
  return [
    {
      required,
      asyncValidator: async (_rule, value) => {
        const currentRevision = ++revision;
        const languages = translateLanguages(field);
        const values = translateValues(value, languages[0]?.code ?? 'en');
        // 单独校验每种语言，既支持普通规则，也支持 callback / Promise 校验器。
        const results = await Promise.all(
          languages.map(async ({ code }) => {
            try {
              await new AsyncValidator({ [field.prop]: rules }).validate(
                { [field.prop]: values[code] },
                { firstFields: true },
              );
              return [code, ''] as const;
            } catch (error) {
              const failure = error as { errors?: { message?: string }[] };
              return [
                code,
                failure.errors?.[0]?.message || resolvePlaceholder(field),
              ] as const;
            }
          }),
        );
        const errors = Object.fromEntries(
          results.filter(([, message]) => message),
        );
        if (currentRevision === revision) report(errors);
        const firstError = results.find(([, message]) => message)?.[1];
        if (firstError) throw new Error(firstError);
      },
    },
  ];
}
