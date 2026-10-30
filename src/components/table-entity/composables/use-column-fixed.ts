import type { Ref } from 'vue';

import type { ColumnsItem } from '../index.type';

import { computed, ref, watch } from 'vue';

export type ColumnFixedValue = 'left' | 'right' | false;

export interface ColumnFixedItem {
  key: string;
  title: string;
  fixed: ColumnFixedValue;
  initialFixed: ColumnFixedValue;
}

export function useColumnFixed(columns: Ref<ColumnsItem[]>) {
  const fixedMap = ref<Record<string, ColumnFixedValue>>({});

  function getInitialFixed(col: ColumnsItem): ColumnFixedValue {
    if (col.fixed === true || col.fixed === 'left') return 'left';
    if (col.fixed === 'right') return 'right';
    return false;
  }

  function buildInitialMap(
    cols: ColumnsItem[],
  ): Record<string, ColumnFixedValue> {
    const map: Record<string, ColumnFixedValue> = {};
    for (const col of cols) {
      const key = resolveColumnKey(col);
      if (!key) continue;
      map[key] = getInitialFixed(col);
    }
    return map;
  }

  watch(
    () => columns.value,
    (cols) => {
      const init = buildInitialMap(cols);
      const next: Record<string, ColumnFixedValue> = {};
      for (const key of Object.keys(init)) {
        next[key] =
          key in fixedMap.value
            ? (fixedMap.value[key] ?? false)
            : (init[key] ?? false);
      }
      fixedMap.value = next;
    },
    { immediate: true, deep: true },
  );

  const columnMap = computed<Record<string, ColumnsItem>>(() => {
    const map: Record<string, ColumnsItem> = {};
    for (const col of columns.value) {
      const key = resolveColumnKey(col);
      if (key) map[key] = col;
    }
    return map;
  });

  const orderedItems = computed<ColumnFixedItem[]>(() => {
    const map = columnMap.value;
    return Object.keys(fixedMap.value)
      .filter((k) => k in map)
      .map((k) => {
        const column = map[k];
        return {
          key: k,
          title: (column?.title as string) || k,
          fixed: fixedMap.value[k] ?? false,
          initialFixed: column ? getInitialFixed(column) : false,
        };
      });
  });

  function setFixed(key: string, value: ColumnFixedValue) {
    fixedMap.value = { ...fixedMap.value, [key]: value };
  }

  function reset() {
    fixedMap.value = buildInitialMap(columns.value);
  }

  function applyFixed(cols: ColumnsItem[]): ColumnsItem[] {
    return cols.map((col) => {
      const key = resolveColumnKey(col);
      if (!key || !(key in fixedMap.value)) return col;
      const value = fixedMap.value[key] ?? false;
      return { ...col, fixed: (value || undefined) as any };
    });
  }

  return {
    orderedItems,
    setFixed,
    reset,
    applyFixed,
  };
}

function resolveColumnKey(column: ColumnsItem): string {
  return (column.key as string) ?? (column.dataKey as string) ?? '';
}
