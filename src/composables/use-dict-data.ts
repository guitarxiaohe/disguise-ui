import type { DictValueItem } from '@/runtime/dict';

import type { MaybeRefOrGetter } from 'vue';

import { computed, toValue } from 'vue';

import {
  DICT_DATA_ALL_QUERY_KEY,
  fetchAllDictData,
} from '@/runtime/dict';
import { useQuery } from '@tanstack/vue-query';

/** ****************************** 字典缓存查询 ********************************/

export interface DictOption {
  color?: string;
  label: string;
  value: string;
}

// 首次请求后按字典编码缓存全部字典值，默认 30 分钟内命中缓存
export function useAllDictDataQuery(enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: DICT_DATA_ALL_QUERY_KEY,
    queryFn: fetchAllDictData,
    enabled: computed(() => toValue(enabled)),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function isDictValueEnabled(status: unknown) {
  return (
    status === undefined || status === true || status === 1 || status === '1'
  );
}

/** 某个字典编码下的可选项，供下拉 / 单选使用 */
export function toDictOptions(
  items: DictValueItem[] | undefined,
): DictOption[] {
  return (items ?? [])
    .filter((item) => isDictValueEnabled(item.status))
    .map((item) => ({
      label: item.name ?? item.dictLabel ?? '',
      value: String(item.code ?? item.dictValue ?? ''),
      color: item.color ?? item.cssClass,
    }));
}

export function findDictValue(items: DictValueItem[], value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const current = String(value);
  return (
    items.find(
      (item) => String(item.code ?? item.dictValue ?? '') === current,
    ) ?? null
  );
}

/**
 * 按字典编码读取已缓存的字典值。
 * 多个编码共用同一次全量请求。
 */
export function useDictData(code: MaybeRefOrGetter<string | undefined>) {
  const query = useAllDictDataQuery(() => Boolean(toValue(code)));
  const items = computed(() => {
    const key = toValue(code);
    if (!key) return [];
    return query.data.value?.[key] ?? [];
  });
  const options = computed(() => toDictOptions(items.value));

  return { ...query, items, options };
}
