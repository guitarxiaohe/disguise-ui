import type { Ref } from 'vue';

import type { ColumnsItem } from '../index.type';

import { computed, ref, watch } from 'vue';

/** ****************************** 列显示/排序状态管理 ********************************/

export type ColumnSettingItem = {
  /** 列唯一标识 */
  key: string;
  /** 列标题 */
  title: string;
  /** 是否可见 */
  visible: boolean;
  /** 原始列配置引用 */
  column: ColumnsItem;
  headerAlign: ColumnAlignValue;
  contentAlign: ColumnAlignValue;
};

export type ColumnAlignValue = 'center' | 'left' | 'right';

/**
 * 管理列的可见性与排序。
 *
 * - `visibleColumns`: 当前可见列（按用户排序）
 * - `hiddenColumns`: 已隐藏列
 * - `orderedSettings`: 完整设置列表（可见在前，隐藏在后，保持用户排序）
 * - `toggleColumn(key)`: 切换某列显隐
 * - `reorderSettings(newOrder)`: 从拖拽结果同步排序 & 显隐
 * - `reset()`: 恢复初始状态
 */
export function useColumnSettings(columns: Ref<ColumnsItem[]>) {
  /** 用户排序后的列 key 列表（只包含业务列） */
  const orderedKeys = ref<string[]>([]);
  /** 隐藏列 key 集合 */
  const hiddenKeys = ref<Set<string>>(new Set());
  const headerAlignMap = ref<Record<string, ColumnAlignValue>>({});
  const contentAlignMap = ref<Record<string, ColumnAlignValue>>({});
  const userHeaderAlignKeys = new Set<string>();
  const userContentAlignKeys = new Set<string>();
  const sourceAlignMap: Record<
    string,
    { headerAlign: ColumnAlignValue; contentAlign: ColumnAlignValue }
  > = {};

  /** 从 columns prop 提取初始业务列 */
  function buildInitialKeys(cols: ColumnsItem[]): string[] {
    return cols
      .filter((c): c is ColumnsItem => !!c)
      .filter((c) => !!resolveColumnKey(c))
      .map((c) => resolveColumnKey(c));
  }

  // 当 columns prop 变化时重新初始化
  watch(
    () => columns.value,
    (cols) => {
      const currentKeys = orderedKeys.value;
      const incomingKeys = buildInitialKeys(cols);

      // 若 columns 结构发生了增删才重置
      const currentSet = new Set(currentKeys);
      const incomingSet = new Set(incomingKeys);
      const added = incomingKeys.filter((k) => !currentSet.has(k));
      const removed = currentKeys.filter((k) => !incomingSet.has(k));

      if (added.length > 0 || removed.length > 0) {
        // 移除已不存在的 key
        const cleaned = currentKeys.filter((k) => incomingSet.has(k));
        // 新 key 追加到末尾，默认可见
        for (const k of added) {
          if (!cleaned.includes(k)) cleaned.push(k);
        }
        orderedKeys.value = cleaned;
        // 清理已删除列的隐藏状态
        const newHidden = new Set(hiddenKeys.value);
        for (const k of newHidden) {
          if (!incomingSet.has(k)) newHidden.delete(k);
        }
        hiddenKeys.value = newHidden;
      }

      const nextHeaderAlign = { ...headerAlignMap.value };
      const nextContentAlign = { ...contentAlignMap.value };
      for (const col of cols) {
        if (!col) continue;
        const key = resolveColumnKey(col);
        if (!key) continue;

        const headerAlign = getColumnAlign(col.headerAlign ?? col.align);
        const contentAlign = getColumnAlign(col.align);
        const previousSourceAlign = sourceAlignMap[key];

        if (
          !previousSourceAlign ||
          previousSourceAlign.headerAlign !== headerAlign
        ) {
          nextHeaderAlign[key] = headerAlign;
        }
        if (
          !previousSourceAlign ||
          previousSourceAlign.contentAlign !== contentAlign
        ) {
          nextContentAlign[key] = contentAlign;
        }
        sourceAlignMap[key] = { headerAlign, contentAlign };
      }
      for (const key of Object.keys(nextHeaderAlign)) {
        if (!incomingSet.has(key)) {
          delete nextHeaderAlign[key];
          delete sourceAlignMap[key];
          userHeaderAlignKeys.delete(key);
          userContentAlignKeys.delete(key);
        }
      }
      for (const key of Object.keys(nextContentAlign)) {
        if (!incomingSet.has(key)) delete nextContentAlign[key];
      }
      headerAlignMap.value = nextHeaderAlign;
      contentAlignMap.value = nextContentAlign;

      // 首次初始化
      if (orderedKeys.value.length === 0) {
        orderedKeys.value = incomingKeys;
      }
    },
    { immediate: true, deep: true },
  );

  /** 列 key → ColumnsItem 映射 */
  const columnMap = computed<Record<string, ColumnsItem>>(() => {
    const map: Record<string, ColumnsItem> = {};
    for (const col of columns.value) {
      if (!col) continue;
      const key = resolveColumnKey(col);
      if (key) map[key] = col;
    }
    return map;
  });

  /** 完整设置列表（按用户排序，可见在前） */
  const orderedSettings = computed<ColumnSettingItem[]>(() => {
    const map = columnMap.value;
    return orderedKeys.value
      .filter((k) => map[k]) // 只保留存在的列
      .map((k) => ({
        key: k,
        title: (map[k]?.title as string) || k,
        visible: !hiddenKeys.value.has(k),
        column: map[k]!,
        headerAlign:
          headerAlignMap.value[k] ??
          getColumnAlign(map[k]?.headerAlign ?? map[k]?.align),
        contentAlign: contentAlignMap.value[k] ?? getColumnAlign(map[k]?.align),
      }));
  });

  /** 可见列（按用户顺序） */
  const visibleColumns = computed<ColumnsItem[]>(() =>
    orderedSettings.value.filter((s) => s.visible).map((s) => s.column),
  );

  /** 隐藏列 */
  const hiddenColumns = computed<ColumnSettingItem[]>(() =>
    orderedSettings.value.filter((s) => !s.visible),
  );

  /** 切换某列的可见性 */
  function toggleColumn(key: string) {
    const newSet = new Set(hiddenKeys.value);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    hiddenKeys.value = newSet;
  }

  /** 从拖拽后的设置列表同步排序与显隐 */
  function reorderSettings(newSettings: ColumnSettingItem[]) {
    orderedKeys.value = newSettings.map((s) => s.key);
    hiddenKeys.value = new Set(
      newSettings.filter((s) => !s.visible).map((s) => s.key),
    );
  }

  function setHeaderAlign(key: string, value: ColumnAlignValue) {
    headerAlignMap.value = { ...headerAlignMap.value, [key]: value };
    userHeaderAlignKeys.add(key);
  }

  function setContentAlign(key: string, value: ColumnAlignValue) {
    contentAlignMap.value = { ...contentAlignMap.value, [key]: value };
    userContentAlignKeys.add(key);
  }

  function setWidth(key: string, value: number) {
    const column = columns.value.find((item) => resolveColumnKey(item) === key);
    if (column) column.width = value;
  }

  /** 全部显示 */
  function showAll() {
    hiddenKeys.value = new Set();
  }

  /** 恢复初始状态 */
  function reset() {
    userHeaderAlignKeys.clear();
    userContentAlignKeys.clear();
    orderedKeys.value = buildInitialKeys(columns.value);
    hiddenKeys.value = new Set();
    headerAlignMap.value = Object.fromEntries(
      columns.value
        .filter(Boolean)
        .map((col) => [
          resolveColumnKey(col),
          getColumnAlign(col.headerAlign ?? col.align),
        ])
        .filter(([key]) => key),
    );
    contentAlignMap.value = Object.fromEntries(
      columns.value
        .filter(Boolean)
        .map((col) => [resolveColumnKey(col), getColumnAlign(col.align)])
        .filter(([key]) => key),
    );
  }

  function applyAlign(cols: ColumnsItem[]): ColumnsItem[] {
    return cols.map((col) => {
      const key = resolveColumnKey(col);
      const headerAlign =
        key && userHeaderAlignKeys.has(key)
          ? headerAlignMap.value[key]
          : (col.headerAlign ?? col.align);
      const contentAlign =
        key && userContentAlignKeys.has(key)
          ? contentAlignMap.value[key]
          : col.align;
      return {
        ...col,
        ...(contentAlign ? { align: contentAlign } : {}),
        ...(headerAlign ? { headerAlign } : {}),
      };
    });
  }

  return {
    orderedKeys,
    hiddenKeys,
    orderedSettings,
    visibleColumns,
    hiddenColumns,
    toggleColumn,
    reorderSettings,
    setHeaderAlign,
    setContentAlign,
    setWidth,
    applyAlign,
    showAll,
    reset,
  };
}

function getColumnAlign(column?: ColumnsItem | null): ColumnAlignValue {
  const align = column?.align;
  return align === 'center' || align === 'right' ? align : 'left';
}

function resolveColumnKey(column: ColumnsItem): string {
  return (column.key as string) ?? (column.dataKey as string) ?? '';
}
