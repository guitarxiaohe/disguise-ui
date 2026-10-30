import type { TableEntityRowSortPayload } from '../index.type';

import { nextTick, onUnmounted, ref } from 'vue';

type RowDragOptions = {
  getHandle: () => string | undefined;
  getRoot: () => HTMLElement | undefined;
  getRowHeight: () => number;
  getRowKey: () => string;
  getRows: () => Record<string, any>[];
  isEnabled: () => boolean;
  isRowDisabled: (row: Record<string, any>) => boolean;
  onSort: (payload: TableEntityRowSortPayload) => void;
  setRows: (rows: Record<string, any>[]) => void;
};

function readRowIndex(row: HTMLElement, rowHeight: number) {
  const marked = Number(row.dataset.rowIndex);
  if (Number.isInteger(marked) && marked >= 0) return marked;

  const top = Number.parseFloat(row.style.top);
  if (Number.isFinite(top) && rowHeight > 0) {
    return Math.round(top / rowHeight);
  }
  return null;
}

function listRows(root: HTMLElement) {
  return [
    ...root.querySelectorAll<HTMLElement>(
      '.el-table-v2__body .el-table-v2__row',
    ),
  ];
}

function clearRowMotion(root: HTMLElement | undefined) {
  if (!root) return;
  for (const row of listRows(root)) {
    row.style.transition = '';
    row.style.transform = '';
    row.style.zIndex = '';
    row.classList.remove('table-entity__row--lift');
  }
  root.classList.remove('table-entity--row-dragging');
}

/** 按数据下标交换行。虚拟表格的行是绝对定位的，不能靠搬 DOM 排序。 */
export function moveTableRow<T>(rows: T[], from: number, to: number) {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= rows.length ||
    to >= rows.length
  ) {
    return rows;
  }
  const next = [...rows];
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return rows;
  next.splice(to, 0, moved);
  return next;
}

export function useRowDrag(options: RowDragOptions) {
  const draggingIndex = ref<null | number>(null);
  const overIndex = ref<null | number>(null);
  let originX = 0;
  let originY = 0;
  let moved = false;
  let previousCursor = '';
  let previousUserSelect = '';

  function nearestEnabled(index: number, delta: number) {
    const rows = options.getRows();
    if (index < 0 || index >= rows.length) return null;
    const row = rows[index];
    if (row && !options.isRowDisabled(row)) return index;
    const preferred = delta >= 0 ? -1 : 1;
    for (let step = 1; step < rows.length; step += 1) {
      const forward = index + preferred * step;
      const backward = index - preferred * step;
      const forwardRow = rows[forward];
      const backwardRow = rows[backward];
      if (
        forwardRow &&
        forward >= 0 &&
        forward < rows.length &&
        !options.isRowDisabled(forwardRow)
      ) {
        return forward;
      }
      if (
        backwardRow &&
        backward >= 0 &&
        backward < rows.length &&
        !options.isRowDisabled(backwardRow)
      ) {
        return backward;
      }
    }
    return null;
  }

  function applyMotion(deltaY: number) {
    const root = options.getRoot();
    const from = draggingIndex.value;
    const to = overIndex.value;
    if (!root || from == null || to == null) return;
    const rowHeight = options.getRowHeight();
    root.classList.add('table-entity--row-dragging');
    for (const row of listRows(root)) {
      const index = readRowIndex(row, rowHeight);
      if (index == null) continue;
      if (index === from) {
        row.classList.add('table-entity__row--lift');
        row.style.zIndex = '5';
        row.style.transition = 'none';
        row.style.transform = `translateY(${deltaY}px)`;
        continue;
      }
      let shift = 0;
      if (from < to && index > from && index <= to) shift = -rowHeight;
      if (from > to && index >= to && index < from) shift = rowHeight;
      row.classList.remove('table-entity__row--lift');
      row.style.zIndex = '';
      row.style.transition = 'transform 0.2s ease';
      row.style.transform = shift === 0 ? '' : `translateY(${shift}px)`;
    }
  }

  function snapshotTops(root: HTMLElement) {
    const tops = new Map<string, number>();
    for (const row of listRows(root)) {
      const key = row.dataset.rowKey;
      if (!key) continue;
      tops.set(key, row.getBoundingClientRect().top);
    }
    return tops;
  }

  function playFlip(root: HTMLElement, before: Map<string, number>) {
    const moving: HTMLElement[] = [];
    for (const row of listRows(root)) {
      row.style.transition = 'none';
      row.style.transform = '';
    }
    root.getBoundingClientRect();
    for (const row of listRows(root)) {
      const key = row.dataset.rowKey;
      const previous = key ? before.get(key) : undefined;
      if (previous == null) continue;
      const delta = previous - row.getBoundingClientRect().top;
      if (Math.abs(delta) < 1) continue;
      row.style.transform = `translateY(${delta}px)`;
      moving.push(row);
    }
    root.getBoundingClientRect();
    requestAnimationFrame(() => {
      for (const row of moving) {
        row.style.transition = 'transform 0.22s ease';
        row.style.transform = '';
        const done = () => {
          row.style.transition = '';
          row.removeEventListener('transitionend', done);
        };
        row.addEventListener('transitionend', done);
      }
    });
  }

  function cleanup() {
    clearRowMotion(options.getRoot());
    draggingIndex.value = null;
    overIndex.value = null;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.body.style.cursor = previousCursor;
    document.body.style.userSelect = previousUserSelect;
  }

  function onPointerMove(event: PointerEvent) {
    const root = options.getRoot();
    const from = draggingIndex.value;
    if (!root || from == null) return;
    const deltaY = event.clientY - originY;
    if (Math.abs(event.clientX - originX) > 3 || Math.abs(deltaY) > 3) {
      moved = true;
    }
    const rowHeight = options.getRowHeight();
    const raw = from + Math.round(deltaY / Math.max(rowHeight, 1));
    const max = options.getRows().length - 1;
    const clamped = Math.max(0, Math.min(max, raw));
    const next = nearestEnabled(clamped, deltaY);
    if (next != null) overIndex.value = next;
    if (moved) applyMotion(deltaY);
  }

  async function onPointerUp() {
    const from = draggingIndex.value;
    const to = overIndex.value;
    const didMove = moved;
    const root = options.getRoot();
    const before =
      root && from != null && to != null && from !== to
        ? snapshotTops(root)
        : null;
    cleanup();
    if (didMove) {
      const swallowClick = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        document.removeEventListener('click', swallowClick, true);
      };
      document.addEventListener('click', swallowClick, true);
    }
    if (!before || !root || from == null || to == null || from === to) return;
    const rows = moveTableRow(options.getRows(), from, to);
    if (rows === options.getRows()) return;
    options.setRows(rows);
    options.onSort({ newIndex: to, oldIndex: from, rows });
    await nextTick();
    playFlip(root, before);
  }

  function onPointerDown(event: PointerEvent) {
    if (!options.isEnabled() || event.button !== 0) return;
    const root = options.getRoot();
    const target = event.target;
    if (!root || !(target instanceof Element)) return;

    const handle = options.getHandle();
    if (!handle || !target.closest(handle)) return;

    const row = target.closest<HTMLElement>('.el-table-v2__row');
    if (!row || !root.contains(row)) return;
    const index = readRowIndex(row, options.getRowHeight());
    const source = index == null ? undefined : options.getRows()[index];
    if (index == null || !source || options.isRowDisabled(source)) return;

    event.preventDefault();
    originX = event.clientX;
    originY = event.clientY;
    moved = false;
    draggingIndex.value = index;
    overIndex.value = index;
    previousCursor = document.body.style.cursor;
    previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  onUnmounted(cleanup);

  return {
    draggingIndex,
    onPointerDown,
    overIndex,
  };
}
