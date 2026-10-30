import type {
  FieldContext,
  FieldOption,
  ResolvedField,
} from './schema-form.type';

import { computed, type ComputedRef } from 'vue';

import { useDictData } from '@/composables/use-dict-data';

/** 统一 static 与 dict 两种来源的选项，api 来源由 async-select 自行取数 */
export function useFieldOptions(
  getField: () => ResolvedField,
  context: ComputedRef<FieldContext>,
) {
  const { options: dictOptions } = useDictData(() => {
    const field = getField();
    return field.optionSource === 'dict' ? field.dictCode : '';
  });

  return computed<FieldOption[]>(() => {
    const field = getField();
    if (field.optionSource !== 'dict') {
      return typeof field.options === 'function'
        ? field.options(context.value)
        : (field.options ?? []);
    }
    return dictOptions.value;
  });
}
