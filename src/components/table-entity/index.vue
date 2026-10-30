<script setup lang="ts">
import type { ImportDialogSubmitResult } from '@/components/import-dialog/index.type';

import type {
  ColumnsItem,
  TableEntityActionName,
  TableEntityActionPayload,
  TableEntityChangePayload,
  TableEntityRowKey,
  TableEntityRowSortPayload,
  TableEntitySortOrder,
  TableEntlty,
} from './index.type';

import {
  computed,
  h,
  reactive,
  ref,
  resolveDirective,
  useSlots,
  watch,
  withDirectives,
} from 'vue';

import { useAccess } from '@/runtime/access';

import ImportDialog from '@/components/import-dialog/index';
import { Lock, Rank, Refresh, Setting } from '@element-plus/icons-vue';
import { useElementSize } from '@vueuse/core';
import {
  ElButton,
  ElDrawer,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElPagination,
  ElPopover,
  ElTableV2,
  ElTooltip,
} from 'element-plus';

import { $t as t } from '@/runtime/i18n';

import ColumnFixedPanel from './components/ColumnFixedPanel.vue';
import ColumnSettingsPanel from './components/ColumnSettingsPanel.vue';
import { useColumnFixed } from './composables/use-column-fixed';
import { useColumnResize } from './composables/use-column-resize';
import { useColumnSettings } from './composables/use-column-settings';
import { useRowDrag } from './composables/use-row-drag';
import { useTableSelection } from './composables/use-table-selection';
import { applyColumnSlots } from './utils/column-slots';
import { listExpandColumnKey, listExpandStateKey } from './utils/list-expand';
const props = withDefaults(defineProps<TableEntlty>(), {
  height: 630,
  rowHeight: 40,
  cache: 1,
  selectable: true,
  multiple: true,
  rowKey: 'id',
  selectedKeys: () => [],
  tree: false,
  treeChildrenKey: 'children',
  expandColumnKey: '',
  expandedRowKeys: undefined,
  defaultExpandedRowKeys: () => [],
  indentSize: 12,
  iconSize: 12,
  per_page: 100,
  current_page: 1,
  query: () => ({}),
  showPagination: true,
  columns: () => [],
  data: () => [],
  showActions: true,
  actionColumnTitle: '',
  actions: () => ['edit', 'delete'],
  pushActions: () => [],
  rowDraggable: false,
  rowDragHandle: undefined,
  rowDragDisabled: undefined,
  resizable: true,
  minColumnWidth: 30,
  showColumnSettings: true,
  permissionCode: '',
  importDialog: undefined,
});
const emit = defineEmits<{
  'update:selectedKeys': [keys: any[]];
  'update:current_page': [page: number];
  'update:page': [page: number];
  'update:per_page': [size: number];
  'update:expandedRowKeys': [keys: TableEntityRowKey[]];
  'selection-change': [rows: Record<string, any>[]];
  expandedRowsChange: [keys: TableEntityRowKey[]];
  rowExpand: [
    payload: {
      expanded: boolean;
      rowData: Record<string, any>;
      rowIndex: number;
      rowKey: TableEntityRowKey;
    },
  ];

  pageChange: [page: number];
  change: [payload: TableEntityChangePayload];
  refresh: [];
  /** 操作列按钮点击 */
  'handle-action': [payload: TableEntityActionPayload];
  /** 导入成功（ImportDialog 提交成功后回传结果） */
  importSuccess: [result: ImportDialogSubmitResult];
  /** 导入失败（ImportDialog 提交失败后回传错误） */
  importError: [error: Error | ImportDialogSubmitResult];
  /** 行拖拽排序完成，rows 为当前页的新顺序 */
  rowSort: [payload: TableEntityRowSortPayload];
}>();

/** 导入弹窗显隐（importDialog 传入配置时，点击“导入”按钮打开） */
const importDialogVisible = ref(false);

const settingsDrawerVisible = ref(false);
const ACTION_LABEL_MAP: Record<
  TableEntityActionName,
  { label: string; type: 'danger' | 'primary' }
> = {
  view: { label: t('components.tableEntity.view'), type: 'primary' },
  edit: { label: t('components.tableEntity.edit'), type: 'primary' },
  copy: { label: t('components.tableEntity.copy'), type: 'primary' },
  delete: { label: t('components.tableEntity.delete'), type: 'danger' },
};
const total = ref(0);
const DEFAULT_PAGE_SIZES: number[] = [10, 50, 300, 400, 800, 1000];

function resolvePageSizes(raw: string | undefined): number[] {
  if (!raw) return [...DEFAULT_PAGE_SIZES];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...DEFAULT_PAGE_SIZES];

    const normalized = parsed
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item) && item > 0);

    return normalized.length > 0 ? normalized : [...DEFAULT_PAGE_SIZES];
  } catch {
    return [...DEFAULT_PAGE_SIZES];
  }
}

const pageSizes = resolvePageSizes(import.meta.env.VITE_PAGE_SIZES);

const slots = useSlots();
const { hasAccessByCodes } = useAccess();

const dataList = ref<Record<string, any>[]>([]);
/** 列表折叠单元格的展开状态，key 为「行主键::列 key」 */
const listExpandedKeys = ref(new Set<string>());
const loading = ref(false);
const internalExpandedRowKeys = ref<TableEntityRowKey[]>([
  ...(props.defaultExpandedRowKeys ?? []),
]);
const tableViewportRef = ref<HTMLElement>();
const { width: viewportWidth } = useElementSize(tableViewportRef);

const pagination = reactive({
  current_page: props.current_page,
  per_page: props.per_page,
});

const resolvedTableWidth = computed(() =>
  Math.max(1, Math.floor(props.width ?? viewportWidth.value)),
);

const resolvedTotal = computed(() =>
  props.total == null ? total.value : Number(props.total),
);

/** 工具栏可见：有列设置 或 数据是异步获取（可刷新） */
const showToolbar = computed(
  () => props.showColumnSettings || typeof props.data === 'function',
);

/** 手动刷新表格数据 */
function refresh() {
  emit('refresh');
  loadData();
}

// ElTableV2 uses `dataKey` to read values from each row. Accept `dataIndex`
// as well so callers can reuse the familiar ElTable column configuration.
const preparedColumns = computed(() =>
  props.columns.filter(Boolean).map((column) => ({
    ...column,
    dataKey: column.dataKey ?? column.dataIndex,
  })),
);

const listExpandColumns = computed(() =>
  preparedColumns.value.filter((column) => column.type === 'listExpand'),
);

const listExpandEnabled = computed(
  () => !props.tree && listExpandColumns.value.length > 0,
);

function toggleListExpand(key: string) {
  const next = new Set(listExpandedKeys.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  listExpandedKeys.value = next;
}

const businessColumns = computed(() =>
  applyColumnSlots(preparedColumns.value, slots, {
    expandedKeys: listExpandedKeys.value,
    onToggle: toggleListExpand,
    rowKey: props.rowKey ?? 'id',
  }),
);

const initialSortColumn = props.columns.find((column) => column.sortOrder);
const sortState = ref<{
  field?: string;
  order?: TableEntitySortOrder;
}>({
  field: initialSortColumn
    ? String(
        initialSortColumn.dataKey ??
          initialSortColumn.dataIndex ??
          initialSortColumn.key ??
          '',
      ) || undefined
    : undefined,
  order: initialSortColumn?.sortOrder,
});

function getColumnField(column: ColumnsItem) {
  const field = column.dataKey ?? column.dataIndex ?? column.key;
  return field == null ? undefined : String(field);
}

function handleColumnSort(column: ColumnsItem) {
  if (!column.sortable && !column.sortOrder) return;
  const field = getColumnField(column);
  if (!field) return;

  const order =
    sortState.value.field === field && sortState.value.order === 'asc'
      ? 'desc'
      : 'asc';
  sortState.value = { field, order };

  if (pagination.current_page !== 1) {
    pagination.current_page = 1;
    // Keep the legacy snake_case event for existing consumers.
    // eslint-disable-next-line vue/custom-event-name-casing
    emit('update:current_page', 1);
    emit('update:page', 1);
    emitChange();
    return;
  }
  emitChange();
  if (typeof props.data === 'function') {
    loadData();
  }
}

function emitChange() {
  emit('change', {
    current_page: pagination.current_page,
    page: pagination.current_page,
    per_page: pagination.per_page,
    sortField: sortState.value.field,
    sortOrder: sortState.value.order,
  });
}

/** ****************************** 列设置（排序/显隐） ********************************/

const columnSettings = useColumnSettings(businessColumns);

/** ****************************** 列冻结（左固定/右固定） ********************************/

const columnFixed = useColumnFixed(businessColumns);

function resetColumnSettings() {
  columnSettings.reset();
  columnFixed.reset();
}

/** ****************************** 列宽拖拽 ********************************/

const { applyColumnWidths, resizeLineStyle, onViewportMouseDown } =
  useColumnResize(props.minColumnWidth);

/** 应用列设置（排序/显隐）、列冻结与宽度覆盖 */
const resizedBusinessColumns = computed(() => {
  const source = props.showColumnSettings
    ? columnSettings.visibleColumns.value
    : businessColumns.value;
  return columnFixed.applyFixed(
    columnSettings.applyAlign(applyColumnWidths(source)),
  );
});

const resolvedExpandColumnKey = computed(() => {
  if (!props.tree) return undefined;
  if (props.expandColumnKey) return props.expandColumnKey;

  const firstColumn = businessColumns.value.find((column) => {
    const key = column.key ?? column.dataKey;
    return key != null && String(key) !== '';
  });
  const key = firstColumn?.key ?? firstColumn?.dataKey;
  return key == null ? undefined : String(key);
});
const resolvedExpandedRowKeys = computed(
  () => props.expandedRowKeys ?? internalExpandedRowKeys.value,
);
const tableData = computed(() => {
  if (!props.tree || props.treeChildrenKey === 'children') {
    return dataList.value;
  }
  return normalizeTreeChildren(dataList.value, props.treeChildrenKey);
});

function withListExpandMeasureKey(
  rows: Record<string, any>[],
): Record<string, any>[] {
  const rowKey = props.rowKey ?? 'id';
  const childrenKey = props.treeChildrenKey ?? 'children';
  const columnKeys = listExpandColumns.value.map((column) =>
    listExpandColumnKey(column),
  );
  return rows.map((row) => {
    const flags = columnKeys
      .map((columnKey) =>
        listExpandedKeys.value.has(listExpandStateKey(row[rowKey], columnKey))
          ? '1'
          : '0',
      )
      .join('');
    const next: Record<string, any> = {
      ...row,
      __measureKey: `${row[rowKey]}:${flags}`,
    };
    if (Array.isArray(row[childrenKey])) {
      next[childrenKey] = withListExpandMeasureKey(row[childrenKey]);
    }
    return next;
  });
}

/** 折叠状态变化后换行 key，让虚拟表格按新内容重新量行高 */
const renderedTableData = computed(() =>
  listExpandEnabled.value
    ? withListExpandMeasureKey(tableData.value)
    : tableData.value,
);

const selectionRows = computed(() =>
  props.tree
    ? flattenTreeRows(tableData.value, resolvedExpandedRowKeys.value)
    : dataList.value,
);
const allRows = computed(() =>
  props.tree ? flattenTreeRows(tableData.value) : dataList.value,
);

watch(
  () => props.current_page,
  (page) => {
    pagination.current_page = page;
  },
);

watch(
  () => props.per_page,
  (size) => {
    pagination.per_page = size;
  },
);

// data 源变化时重新加载
watch(
  () => props.data,
  async () => {
    await loadData();
  },
  { deep: true, immediate: true },
);

// 分页变化时重新加载（仅异步数据源）
watch(
  () => [pagination.current_page, pagination.per_page],
  async () => {
    if (typeof props.data === 'function') {
      await loadData();
    }
  },
);

watch(
  () => props.expandedRowKeys,
  (keys) => {
    if (keys) {
      internalExpandedRowKeys.value = [...keys];
    }
  },
  { immediate: true },
);

const {
  selectionColumn,
  rowEventHandlers,
  clearSelection,
  getSelectedRows,
  getSelectedCount,
  setSelectedKeys,
} = useTableSelection(props, emit, selectionRows, allRows);

function openImport() {
  if (!props.importDialog) return false;
  importDialogVisible.value = true;
  return true;
}

/** 导入成功：回传结果并刷新表格数据 */
function handleImportSuccess(result: ImportDialogSubmitResult) {
  emit('importSuccess', result);
  loadData();
}

/** 导入失败：回传错误 */
function handleImportError(error: Error | ImportDialogSubmitResult) {
  emit('importError', error);
}

const actionColumnKey = '__actions__';
const dragColumnKey = '__drag__';
const dragHandleClass = 'table-entity__drag-handle';

const rowDragEnabled = computed(() => props.rowDraggable && !props.tree);
const { onPointerDown: onRowPointerDown } = useRowDrag({
  getHandle: () => props.rowDragHandle || `.${dragHandleClass}`,
  getRoot: () => tableViewportRef.value,
  getRowHeight: () => props.rowHeight,
  getRowKey: () => props.rowKey ?? 'id',
  getRows: () => dataList.value,
  isEnabled: () => rowDragEnabled.value,
  isRowDisabled: (row) => props.rowDragDisabled?.(row) ?? false,
  onSort: (payload) => emit('rowSort', payload),
  setRows: (rows) => {
    dataList.value = rows;
  },
});

function dragRowClass({ rowData }: { rowData: Record<string, any> }) {
  if (!rowDragEnabled.value) return '';
  const classes: string[] = [];
  if (props.rowDragDisabled?.(rowData)) {
    classes.push('table-entity__row--drag-disabled');
  }
  return classes.join(' ');
}

function dragRowProps({
  rowData,
  rowIndex,
}: {
  rowData: Record<string, any>;
  rowIndex: number;
}) {
  if (!rowDragEnabled.value) return {};
  const key = rowData?.[props.rowKey ?? 'id'];
  return {
    'data-row-index': rowIndex,
    'data-row-key': key == null ? String(rowIndex) : String(key),
  };
}

const dragColumn = computed<ColumnsItem>(() => ({
  key: dragColumnKey,
  dataKey: dragColumnKey,
  title: '',
  width: 40,
  cellRenderer: ({ rowData }: { rowData: Record<string, any> }) => {
    if (props.rowDragDisabled?.(rowData)) return null;
    return h(
      'span',
      { class: dragHandleClass, title: '拖拽排序' },
      h(ElIcon, { size: 16 }, () => h(Rank)),
    );
  },
}));

function getActionPermissionCode(action?: string) {
  if (!action || !props.permissionCode) return undefined;
  const suffix =
    action === 'delete' ? 'remove' : action === 'view' ? 'query' : action;
  return `${props.permissionCode}:${suffix}`;
}

/** 判断操作是否有权限，结果用于操作数量分流。 */
function hasActionPermission(action?: string): boolean {
  const permissionCode = getActionPermissionCode(action);
  return !permissionCode || hasAccessByCodes([permissionCode]);
}

/** 缓存有权限的操作名称，权限变化时重新计算操作列。 */
const accessibleActionNames = computed(() => {
  const names = new Set<string>();
  for (const action of props.actions ?? []) {
    if (hasActionPermission(action)) names.add(action);
  }
  for (const item of props.pushActions ?? []) {
    if (item.name && hasActionPermission(item.name)) names.add(item.name);
  }
  return names;
});

function withActionAccess(node: any, action?: string) {
  const permissionCode = getActionPermissionCode(action);
  const accessDirective = resolveDirective('access');

  if (!permissionCode || !accessDirective) return node;

  return withDirectives(node, [[accessDirective, [permissionCode]]]);
}

/** 操作列固定宽度，保证不同操作数量下表格布局保持稳定。 */
const resolvedActionColumnWidth = computed(() => {
  return 50;
});

/** 内置操作列 */
const actionColumn = computed<ColumnsItem | null>(() => {
  if (!props.showActions) return null;

  const permittedActionNames = accessibleActionNames.value;

  return {
    key: actionColumnKey,
    dataKey: actionColumnKey,
    title: props.actionColumnTitle || t('components.tableEntity.action'),
    width: resolvedActionColumnWidth.value,
    fixed: 'right',
    cellRenderer: (ctx: {
      rowData: Record<string, any>;
      rowIndex: number;
      cellData: unknown;
      column: ColumnsItem;
    }) => {
      const slotFn = slots.actionsCol;
      if (slotFn) {
        // 用户提供了自定义插槽 → 完全由插槽接管
        return h(
          'div',
          { class: 'table-entity__actions' },
          slotFn({
            row: ctx.rowData,
            value: undefined,
            cellData: undefined,
            column: ctx.column,
            rowIndex: ctx.rowIndex,
          }),
        );
      }

      // 收集所有 action 定义（内置 + pushActions）
      type ActionSpec = {
        name?: string;
        label?: string;
        type?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
        component?: any;
      };
      const specs: ActionSpec[] = [];

      // 内置按钮
      for (const name of props.actions ?? []) {
        const cfg = ACTION_LABEL_MAP[name];
        if (!cfg) continue;
        specs.push({ name, label: t(cfg.label), type: cfg.type });
      }

      // 自定义追加按钮
      for (const item of props.pushActions ?? []) {
        if (item.component) {
          specs.push({ component: item.component });
        } else if (item.name && item.label) {
          specs.push({
            name: item.name,
            label: item.label,
            type: item.type ?? 'primary',
          });
        }
      }

      // 先按权限过滤，再决定是否收进更多菜单，避免无权限操作影响数量判断。
      const visibleSpecs = specs.filter(
        (spec) => !spec.name || permittedActionNames.has(spec.name),
      );

      // 将一个 spec 渲染为可见元素
      function renderSpec(spec: ActionSpec, applyAccess = true): any {
        if (spec.component) {
          let node;
          if (typeof spec.component === 'function') {
            node = (
              spec.component as (ctx: {
                row: Record<string, any>;
              }) => ReturnType<typeof h>
            )({ row: ctx.rowData });
          } else {
            node = h(spec.component, { row: ctx.rowData });
          }
          return applyAccess ? withActionAccess(node, spec.name) : node;
        }
        const onAction = () =>
          (emit as any)('handle-action', {
            action: spec.name!,
            row: ctx.rowData,
          });
        const button = h(
          ElButton,
          { type: spec.type, link: true, size: 'small', onClick: onAction },
          () => spec.label,
        );
        return applyAccess ? withActionAccess(button, spec.name) : button;
      }

      const overflow = visibleSpecs.length > 1 ? visibleSpecs : [];
      const visible = overflow.length > 0 ? [] : visibleSpecs;
      const visibleNodes = visible.map((spec) => renderSpec(spec));

      if (overflow.length > 0) {
        // 多个可见操作统一收进悬停触发的下拉菜单。
        const moreBtn = h(
          ElDropdown,
          { trigger: 'hover', placement: 'bottom-end' },
          {
            default: () =>
              h(
                ElButton,
                {
                  link: true,
                  size: 'small',
                  title: t('components.tableEntity.moreActions'),
                },
                () => '...',
              ),
            dropdown: () =>
              h(ElDropdownMenu, {}, () =>
                overflow.map((spec, index) => {
                  if (spec.component) {
                    return withActionAccess(
                      h(
                        ElDropdownItem,
                        { key: spec.name ?? `component-${index}` },
                        () => renderSpec(spec, false),
                      ),
                      spec.name,
                    );
                  }

                  return withActionAccess(
                    h(
                      ElDropdownItem,
                      {
                        key: spec.name,
                        onClick: () =>
                          (emit as any)('handle-action', {
                            action: spec.name!,
                            row: ctx.rowData,
                          }),
                      },
                      () =>
                        h(
                          ElButton,
                          {
                            link: true,
                            size: 'small',
                            type: spec.type,
                          },
                          () => spec.label,
                        ),
                    ),
                  );
                }),
              ),
          },
        );
        return h('div', { class: 'table-entity__actions' }, [
          ...visibleNodes,
          moreBtn,
        ]);
      }

      return h('div', { class: 'table-entity__actions' }, visibleNodes);
    },
  };
});

const displayColumns = computed(() => {
  const columns: ColumnsItem[] = [];
  if (rowDragEnabled.value && !props.rowDragHandle) {
    columns.push(dragColumn.value);
  }
  if (props.selectable) {
    columns.push(selectionColumn.value);
  }
  columns.push(...resizedBusinessColumns.value);
  if (actionColumn.value) {
    columns.push(actionColumn.value);
  }
  return fillColumnsToViewport(columns, resolvedTableWidth.value);
});

function applyColumnHeaderAlign(columns: ColumnsItem[]) {
  return columns.map((column) => {
    const originalHeaderCellRenderer = column.headerCellRenderer;
    const field = getColumnField(column);
    const isSorted = sortState.value.field === field;
    const isSortable = Boolean(column.sortable || column.sortOrder);
    const sortIcon =
      isSortable && isSorted
        ? h('span', {
            class: [
              'table-entity__sort-arrow',
              sortState.value.order === 'desc'
                ? 'table-entity__sort-arrow--desc'
                : 'table-entity__sort-arrow--asc',
            ],
          })
        : isSortable
          ? h('span', { class: 'table-entity__sort-icons' }, [
              h('span', { class: 'table-entity__sort-arrow--asc' }),
              h('span', { class: 'table-entity__sort-arrow--desc' }),
            ])
          : null;
    return {
      ...column,
      width: column.width ?? 120,
      headerCellRenderer: (ctx: any) =>
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              width: '100%',
              justifyContent: column.headerAlign ?? 'left',
              textAlign: column.headerAlign ?? 'left',
              cursor: isSortable ? 'pointer' : undefined,
            },
            onClick: isSortable
              ? (event: MouseEvent) => {
                  event.stopPropagation();
                  handleColumnSort(column);
                }
              : undefined,
          },
          [
            originalHeaderCellRenderer
              ? originalHeaderCellRenderer(ctx)
              : column.title,
            sortIcon,
          ],
        ),
    };
  });
}

async function loadData() {
  if (Array.isArray(props.data)) {
    dataList.value = [...props.data];
    total.value = dataList.value.length;
    return;
  }

  if (typeof props.data !== 'function') {
    dataList.value = [];
    return;
  }

  loading.value = true;
  try {
    const response = await props.data({
      current_page: pagination.current_page,
      page: pagination.current_page,
      per_page: pagination.per_page,
      query: props.query,
      sortField: sortState.value.field,
      sortOrder: sortState.value.order,
    });
    dataList.value = response.rows!;
    total.value = response.total!;
  } finally {
    loading.value = false;
  }
}

function fillColumnsToViewport(columns: ColumnsItem[], tableWidth: number) {
  if (columns.length === 0 || tableWidth <= 1) return columns;

  const normalizedColumns = columns.map((column) => ({
    ...column,
    width: Number(column.width ?? 120),
  }));
  const totalWidth = normalizedColumns.reduce(
    (sum, column) => sum + Number(column.width ?? 0),
    0,
  );

  if (totalWidth >= tableWidth) {
    return normalizedColumns;
  }

  // 操作列保持按按钮数量计算出的宽度，剩余空间只分配给业务列。
  const flexibleColumns = normalizedColumns.filter(
    (column) =>
      column.dataKey !== actionColumnKey &&
      column.dataKey !== '__sel__' &&
      column.dataKey !== dragColumnKey,
  );
  if (flexibleColumns.length === 0) return normalizedColumns;

  const gap = tableWidth - totalWidth;
  const flexibleTotalWidth = flexibleColumns.reduce(
    (sum, column) => sum + Number(column.width ?? 0),
    0,
  );
  return normalizedColumns.map((col) => {
    if (
      col.dataKey === actionColumnKey ||
      col.dataKey === '__sel__' ||
      col.dataKey === dragColumnKey
    ) {
      return col;
    }
    const width = Number(col.width ?? 120);
    return {
      ...col,
      width: width + (gap * width) / Math.max(flexibleTotalWidth, 1),
    };
  });
}

function normalizeTreeChildren(
  rows: Record<string, any>[],
  childrenKey = 'children',
): Record<string, any>[] {
  return rows.map((row) => {
    const children = row[childrenKey];
    if (!Array.isArray(children)) {
      return row;
    }
    return {
      ...row,
      children: normalizeTreeChildren(children, childrenKey),
    };
  });
}

function flattenTreeRows(
  rows: Record<string, any>[],
  expandedKeys?: TableEntityRowKey[],
): Record<string, any>[] {
  const result: Record<string, any>[] = [];
  const expandedKeySet = expandedKeys ? new Set(expandedKeys) : undefined;
  const rowKey = props.rowKey ?? 'id';

  function append(items: Record<string, any>[]) {
    items.forEach((row) => {
      result.push(row);
      const children = row.children;
      if (!Array.isArray(children) || children.length === 0) {
        return;
      }
      if (!expandedKeySet || expandedKeySet.has(row[rowKey])) {
        append(children);
      }
    });
  }

  append(rows);
  return result;
}

function setExpandedRowKeys(keys: TableEntityRowKey[]) {
  internalExpandedRowKeys.value = [...keys];
  emit('update:expandedRowKeys', [...keys]);
}

function handleExpandedRowKeysChange(keys: TableEntityRowKey[]) {
  setExpandedRowKeys(keys);
}

function handleExpandedRowsChange(keys: TableEntityRowKey[]) {
  setExpandedRowKeys(keys);
  emit('expandedRowsChange', [...keys]);
}

function handleRowExpand(payload: {
  expanded: boolean;
  rowData: Record<string, any>;
  rowIndex: number;
  rowKey: TableEntityRowKey;
}) {
  emit('rowExpand', payload);
}

function onPageChange(page: number) {
  pagination.current_page = page;
  // Keep the legacy snake_case event for existing consumers.
  // eslint-disable-next-line vue/custom-event-name-casing
  emit('update:current_page', page);
  emit('pageChange', page);
  emitChange();
}

function handleSizeChange(size: number) {
  pagination.per_page = size;
  // Keep the legacy snake_case event for existing consumers.
  // eslint-disable-next-line vue/custom-event-name-casing
  emit('update:per_page', size);
  emitChange();
}

async function reload(page?: number) {
  if (page != null && pagination.current_page !== page) {
    pagination.current_page = page;
    // Keep the legacy snake_case event for existing consumers.
    // eslint-disable-next-line vue/custom-event-name-casing
    emit('update:current_page', page);
    emitChange();
    return;
  }
  await loadData();
}

defineExpose({
  clearSelection,
  getSelectedRows,
  getSelectedCount,
  setSelectedKeys,
  openImport,
  reload,
});
</script>

<template>
  <div
    class="table-entity"
    :class="{
      'table-entity--large-row': props.rowHeight > 40,
      'table-entity--dynamic-row': listExpandEnabled,
    }"
  >
    <div class="flex justify-between mb-1"></div>
    <!-- 工具栏 -->
    <div
      class="table-entity__toolbar"
      :style="{
        width: `${width}px`,
      }"
    >
      <div class="table-entity__toolbar-right">
        <div class="buttons">
          <slot name="buttons"></slot>
        </div>
      </div>
      <div class="table-entity__toolbar-left" v-if="showToolbar">
        <ElTooltip
          :content="t('components.tableEntity.refresh')"
          placement="top"
        >
          <ElButton
            :icon="Refresh"
            circle
            size="small"
            :title="t('components.tableEntity.refresh')"
            @click="refresh"
          />
        </ElTooltip>

        <div>
          <ElTooltip
            :content="t('components.tableEntity.columnSettings')"
            placement="top"
          >
            <ElButton
              class="table-entity__settings-btn"
              :icon="Setting"
              circle
              size="small"
              @click="settingsDrawerVisible = true"
            />
          </ElTooltip>
        </div>

        <ElDrawer
          v-if="props.showColumnSettings"
          v-model="settingsDrawerVisible"
          :title="t('components.tableEntity.columnConfig')"
          direction="rtl"
          size="640px"
        >
          <ColumnSettingsPanel
            :settings="columnSettings.orderedSettings.value"
            :fixed-items="columnFixed.orderedItems.value"
            @toggle="columnSettings.toggleColumn"
            @set-header-align="columnSettings.setHeaderAlign"
            @set-content-align="columnSettings.setContentAlign"
            @set-width="columnSettings.setWidth"
            @set-fixed="columnFixed.setFixed"
            @reset="resetColumnSettings"
            @update:settings="columnSettings.reorderSettings"
          />
        </ElDrawer>

        <ElPopover
          v-if="false"
          placement="bottom-end"
          :width="280"
          trigger="click"
          :show-arrow="false"
          popper-class="table-entity__fixed-popover"
        >
          <template #reference>
            <ElButton
              :icon="Lock"
              circle
              size="small"
              :title="t('components.tableEntity.freezeColumn')"
            />
          </template>
          <ColumnFixedPanel
            :items="columnFixed.orderedItems.value"
            @set-fixed="columnFixed.setFixed"
            @reset="columnFixed.reset"
          />
        </ElPopover>
      </div>
    </div>

    <div
      ref="tableViewportRef"
      v-loading="loading"
      class="table-entity__viewport"
      @mousedown="onViewportMouseDown"
      @pointerdown="onRowPointerDown"
    >
      <ElTableV2
        :columns="applyColumnHeaderAlign(displayColumns)"
        :data="renderedTableData"
        :width="resolvedTableWidth"
        :height="props.height"
        :row-height="props.rowHeight"
        :row-class="dragRowClass"
        :row-props="dragRowProps"
        :cache="props.cache"
        :estimated-row-height="listExpandEnabled ? props.rowHeight : undefined"
        :row-key="listExpandEnabled ? '__measureKey' : props.rowKey"
        :expand-column-key="resolvedExpandColumnKey"
        :expanded-row-keys="resolvedExpandedRowKeys"
        :default-expanded-row-keys="props.defaultExpandedRowKeys"
        :indent-size="props.indentSize"
        :icon-size="props.iconSize"
        :row-event-handlers="props.selectable ? rowEventHandlers : undefined"
        fixed
        @update:expanded-row-keys="handleExpandedRowKeysChange"
        @expanded-rows-change="handleExpandedRowsChange"
        @row-expand="handleRowExpand"
      />
    </div>

    <!-- 拖拽列宽时的跟随竖线 -->
    <div
      v-if="props.resizable"
      class="table-entity__resize-line"
      :style="resizeLineStyle"
    ></div>

    <div v-if="props.showPagination" class="table-entity__pagination">
      <ElPagination
        :current-page="pagination.current_page"
        :page-size="pagination.per_page"
        :total="resolvedTotal"
        layout="total, sizes, prev, pager, next, jumper"
        background
        :page-sizes="pageSizes"
        @size-change="handleSizeChange"
        @current-change="onPageChange"
      />
    </div>

    <!-- 导入弹窗（import-dialog）：配置透传，modelValue 由点击导入按钮控制 -->
    <ImportDialog
      v-if="props.importDialog"
      v-model="importDialogVisible"
      :api="props.importDialog.api"
      :template-url="props.importDialog.templateUrl"
      :template-method="props.importDialog.templateMethod"
      :title="props.importDialog.title"
      :default-mode="props.importDialog.defaultMode"
      :modes="props.importDialog.modes"
      :accept="props.importDialog.accept"
      :max-size="props.importDialog.maxSize"
      :max-preview-count="props.importDialog.maxPreviewCount"
      :tips="props.importDialog.tips"
      :target-fields="props.importDialog.targetFields"
      :parse-file="props.importDialog.parseFile"
      :submit-import="props.importDialog.submitImport"
      :reset-on-close="props.importDialog.resetOnClose"
      @success="handleImportSuccess"
      @error="handleImportError"
    />
  </div>
</template>

<style scoped lang="scss" src="./index.scss"></style>
