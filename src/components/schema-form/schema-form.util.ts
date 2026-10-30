import type { FormItemRule } from 'element-plus';

import type {
  FieldCondition,
  FieldContext,
  ResolvedEntry,
  ResolvedField,
  ResolvedGroup,
} from './schema-form.type';

import { $t as t } from '@/runtime/i18n';

/** 选择类控件的提示语与校验时机与输入类不同 */
const CHOICE_TYPES = new Set([
  'async-select',
  'checkbox',
  'date',
  'datetime',
  'file',
  'picture',
  'radio',
  'rich-text',
  'select',
  'switch',
  'upload',
]);

export function isChoiceField(field: ResolvedField) {
  return CHOICE_TYPES.has(field.type);
}

export function isGroup(entry: ResolvedEntry): entry is ResolvedGroup {
  return entry.type === 'group';
}

/** 分组只是布局容器，取值与默认值都按平铺后的叶子字段处理 */
export function flattenFields(entries: ResolvedEntry[]): ResolvedField[] {
  return entries.flatMap((entry) =>
    isGroup(entry) ? entry.children : [entry],
  );
}

export function evalCondition(
  condition: FieldCondition | undefined,
  ctx: FieldContext,
) {
  return typeof condition === 'function' ? condition(ctx) : condition === true;
}

export function isFieldHidden(entry: ResolvedEntry, ctx: FieldContext) {
  if (ctx.mode === 'create' && entry.hideOnCreate) return true;
  if (ctx.mode === 'edit' && entry.hideOnEdit) return true;
  return evalCondition(entry.hidden, ctx);
}

export function resolvePlaceholder(field: ResolvedField) {
  if (field.placeholder) return field.placeholder;
  const name = field.label || field.prop;
  return isChoiceField(field)
    ? t('validation.selectField', { field: name })
    : t('validation.enterField', { field: name });
}

export function resolveRules(
  field: ResolvedField,
  context: FieldContext,
): FormItemRule[] {
  const rules = field.rules ? [...field.rules] : [];
  if (evalCondition(field.required, context)) {
    rules.unshift(
      field.translateConfig &&
        ['rich-text', 'text', 'textarea'].includes(field.type)
        ? {
            message: resolvePlaceholder(field),
            trigger: 'change',
            validator: (_rule, value) => {
              const hasContent = (candidate: unknown): boolean => {
                if (typeof candidate === 'string')
                  return candidate.trim().length > 0;
                if (
                  typeof candidate === 'number' ||
                  typeof candidate === 'boolean'
                ) {
                  return true;
                }
                if (Array.isArray(candidate)) {
                  return candidate.some((item) => hasContent(item));
                }
                if (candidate && typeof candidate === 'object') {
                  return Object.values(candidate).some((item) =>
                    hasContent(item),
                  );
                }
                return false;
              };
              const hasTranslatedContent =
                value &&
                typeof value === 'object' &&
                Object.values(value).some((item) => hasContent(item));
              return (
                hasTranslatedContent || new Error(resolvePlaceholder(field))
              );
            },
          }
        : {
            required: true,
            message: resolvePlaceholder(field),
            trigger: isChoiceField(field) ? 'change' : 'blur',
          },
    );
  }
  return rules;
}
