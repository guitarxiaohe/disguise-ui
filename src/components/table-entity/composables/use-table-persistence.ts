import type { Ref } from 'vue';

import type { ColumnsItem, TableEntityProps } from '../index.type';
import type { ColumnFixedValue, useColumnFixed } from './use-column-fixed';
import type { useColumnResize } from './use-column-resize';
import type {
  ColumnAlignValue,
  ColumnSettingsState,
  useColumnSettings,
} from './use-column-settings';

import { computed, onScopeDispose, shallowRef, watch } from 'vue';

import { getStorageKey } from '@/runtime/context';

type TableHeight = NonNullable<TableEntityProps['height']>;

interface TablePreferences extends ColumnSettingsState {
  version: 1;
  height?: TableHeight;
  rowHeight?: number;
  fixed: Record<string, ColumnFixedValue>;
  widths: Record<string, number>;
}

interface PersistenceOptions {
  storageKey: Ref<string | undefined>;
  columns: Ref<ColumnsItem[]>;
  height: Ref<TableHeight | undefined>;
  rowHeight: Ref<number | undefined>;
  settings: ReturnType<typeof useColumnSettings>;
  fixed: ReturnType<typeof useColumnFixed>;
  resize: ReturnType<typeof useColumnResize>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const isPositiveNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;
const isAlign = (value: unknown): value is ColumnAlignValue =>
  value === 'left' || value === 'center' || value === 'right';

function readPreferences(key: string): TablePreferences | undefined {
  try {
    if (typeof window === 'undefined') return;
    const data: unknown = JSON.parse(
      window.localStorage.getItem(key) ?? 'null',
    );
    if (!isRecord(data) || data.version !== 1) return;

    const strings = (value: unknown): string[] =>
      Array.isArray(value)
        ? [
            ...new Set(
              value.filter((key): key is string => typeof key === 'string'),
            ),
          ]
        : [];
    const map = <T>(
      value: unknown,
      valid: (item: unknown) => item is T,
    ): Record<string, T> =>
      Object.fromEntries(
        isRecord(value)
          ? Object.entries(value).filter((entry): entry is [string, T] =>
              valid(entry[1]),
            )
          : [],
      );
    const height = data.height;
    return {
      version: 1,
      height:
        isPositiveNumber(height) ||
        (typeof height === 'string' && /^\d+(?:\.\d+)?%$/.test(height))
          ? (height as TableHeight)
          : undefined,
      rowHeight: isPositiveNumber(data.rowHeight) ? data.rowHeight : undefined,
      orderedKeys: strings(data.orderedKeys),
      hiddenKeys: strings(data.hiddenKeys),
      headerAlign: map(data.headerAlign, isAlign),
      contentAlign: map(data.contentAlign, isAlign),
      fixed: map(
        data.fixed,
        (value): value is ColumnFixedValue =>
          value === false || value === 'left' || value === 'right',
      ),
      widths: map(data.widths, isPositiveNumber),
    };
  } catch {
    // Disabled storage or damaged JSON must not prevent the table from rendering.
    return;
  }
}

/** Only serializable preferences are stored; business columns and renderers stay in props. */
export function useTablePersistence(options: PersistenceOptions) {
  const globalStorageKey = getStorageKey();
  const location = typeof window === 'undefined' ? undefined : window.location;
  const pagePath =
    (location?.pathname ?? '') +
    (location?.hash?.startsWith('#/') ? location.hash.split('?')[0] : '');
  // Capture the first non-empty schema so async columns work and later edits to
  // the schema do not switch the current table's storage identity mid-session.
  const initialColumnKeys = shallowRef<string[]>();
  watch(
    () => options.columns.value,
    (columns) => {
      const keys = columns
        .map((column) => String(column.key ?? column.dataKey ?? ''))
        .filter(Boolean);
      if (!initialColumnKeys.value && keys.length) {
        initialColumnKeys.value = [...new Set(keys)].sort();
      }
    },
    { immediate: true },
  );
  const storageKey = computed(() => {
    if (options.storageKey.value !== undefined) {
      const key = options.storageKey.value.trim();
      return key ? `disguise-ui:table-entity:${key}` : '';
    }
    const prefix = globalStorageKey.value.trim();
    if (!prefix || !initialColumnKeys.value) return '';
    return `disguise-ui:table-entity:${prefix}:${encodeURIComponent(pagePath)}:${encodeURIComponent(JSON.stringify(initialColumnKeys.value))}`;
  });
  const cached = shallowRef<TablePreferences>();
  const height = computed(
    () => options.height.value ?? cached.value?.height ?? '100%',
  );
  const rowHeight = computed(
    () => options.rowHeight.value ?? cached.value?.rowHeight ?? 40,
  );
  const columnKeys = computed(() =>
    options.columns.value
      .map((column) => String(column.key ?? column.dataKey ?? ''))
      .filter(Boolean),
  );

  function restoreColumns() {
    options.settings.reset();
    options.fixed.reset();
    options.resize.reset();
    const state = cached.value;
    if (!state) return;
    options.settings.restoreState(state);
    options.fixed.restoreState(state.fixed);
    for (const key of columnKeys.value) {
      if (Object.hasOwn(state.widths, key)) {
        options.resize.setWidth(key, state.widths[key]!);
      }
    }
  }

  const snapshot = computed<TablePreferences>(() => ({
    version: 1,
    height: height.value,
    rowHeight: rowHeight.value,
    ...options.settings.getState(),
    fixed: options.fixed.getState(),
    widths: Object.fromEntries(
      Object.entries(options.resize.widthOverrides).filter(([key]) =>
        columnKeys.value.includes(key),
      ),
    ),
  }));

  function save(key = storageKey.value) {
    if (!key || !columnKeys.value.length || typeof window === 'undefined')
      return;
    try {
      const next = snapshot.value;
      const serialized = JSON.stringify(next);
      if (JSON.stringify(cached.value) === serialized) return;
      window.localStorage.setItem(key, serialized);
      // Keep the latest preferences for columns that arrive asynchronously.
      // Heights live in cached so removing an explicit prop retains its last value.
      cached.value = next;
    } catch {
      // Quota and browser privacy restrictions leave in-memory settings usable.
    }
  }

  watch(
    storageKey,
    (key, previousKey) => {
      if (previousKey) save(previousKey);
      cached.value = key ? readPreferences(key) : undefined;
      restoreColumns();
    },
    { immediate: true, flush: 'sync' },
  );
  watch(columnKeys, (keys, previousKeys) => {
    if (
      cached.value &&
      JSON.stringify(keys) !== JSON.stringify(previousKeys) &&
      storageKey.value
    ) {
      restoreColumns();
    }
  });
  // Batch a drag's updates and wait for column watchers to reconcile new keys first.
  watch(snapshot, () => save(), { deep: true, flush: 'post', immediate: true });
  onScopeDispose(() => save());

  return { height, rowHeight };
}
