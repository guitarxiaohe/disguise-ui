import type { ColumnsItem } from '../index.type';

import { computed, onUnmounted, reactive } from 'vue';

/** ****************************** 列宽拖拽调整 ********************************/

/**
 * 基于 ElTableV2 原生 header-cell 的列宽拖拽。
 *
 * 思路：不注入自定义 headerCellRenderer，而是通过 CSS ::after 在
 * el-table-v2__header-cell 右侧绘制可拖拽竖线，并在表格容器上委托
 * mousedown 事件检测拖拽意图。
 */
export function useColumnResize(minWidth = 50) {
  /** 各列宽度覆盖值 (px)，key 为列的 data-key */
  const widthOverrides = reactive<Record<string, number>>({});

  const state = reactive({
    active: false,
    colKey: null as null | string,
    startX: 0,
    startWidth: 0,
    currentX: 0,
  });

  function onMouseMove(e: MouseEvent) {
    if (!state.active || !state.colKey) return;
    const delta = e.clientX - state.startX;
    const newWidth = Math.max(minWidth, state.startWidth + delta);
    widthOverrides[state.colKey] = newWidth;
    state.currentX = e.clientX;
  }

  function onMouseUp() {
    if (!state.active) return;
    state.active = false;
    state.colKey = null;
    state.currentX = 0;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  /**
   * 在容器上委托 mousedown，检测是否点在 header-cell 右边缘。
   * 供模板中 @mousedown="onViewportMouseDown" 使用。
   */
  function onViewportMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // 向上查找 el-table-v2__header-cell
    const headerCell = target.closest(
      '.el-table-v2__header-cell',
    ) as HTMLElement | null;
    if (!headerCell) return;

    // 判断鼠标是否在右边缘 10px 内
    const rect = headerCell.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isRightEdge = rect.width - clickX <= 10;

    if (!isRightEdge) return;

    // 获取列 key
    const colKey = headerCell.dataset.key;
    if (!colKey) return;

    e.preventDefault();
    e.stopPropagation();

    const currentWidth = widthOverrides[colKey] ?? rect.width;

    state.colKey = colKey;
    state.startX = e.clientX;
    state.startWidth = currentWidth;
    state.currentX = e.clientX;
    state.active = true;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  /** 将 widthOverrides 应用到列配置 */
  function applyColumnWidths(cols: ColumnsItem[]): ColumnsItem[] {
    if (Object.keys(widthOverrides).length === 0) return cols;
    return cols.map((col) => {
      const key = (col.key as string) ?? (col.dataKey as string) ?? '';
      if (key && widthOverrides[key] != null) {
        return { ...col, width: widthOverrides[key] };
      }
      return col;
    });
  }

  /** 拖拽跟随竖线的响应式样式 */
  const resizeLineStyle = computed(() => ({
    display: state.active ? 'block' : 'none',
    left: `${state.currentX}px`,
  }));

  onUnmounted(() => {
    if (state.active) {
      state.active = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });

  return {
    widthOverrides,
    resizeState: state,
    onViewportMouseDown,
    applyColumnWidths,
    resizeLineStyle,
  };
}
