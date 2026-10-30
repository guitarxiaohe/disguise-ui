import type { ImportDialogProps } from '@/components/import-dialog/index.type';
import type { Column } from 'element-plus';

import type { Component, VNode } from 'vue';

/** ****************************** 列扩展配置 ********************************/

/**
 * TableEntity accepts the same column options as ElTableV2, but width is
 * optional because the component calculates a fallback width automatically.
 * dataIndex is kept as a compatibility alias for regular ElTable columns.
 */
export type ColumnsItem = {
  width?: number;
  dataKey?: string;
  dataIndex?: string;
  headerAlign?: 'center' | 'left' | 'right';
  /** 单元格内容垂直对齐方式 */
  verticalAlign?: 'bottom' | 'center' | 'top';
  /**
   * 单元格内置渲染类型
   * - dict：按字典编码展示标签
   * - picture：图片缩略图，值为 URL 字符串（可逗号分隔）、URL 数组或 `{ fileUrl }` 数组
   * - file：附件图标，值为 AttachmentData 或其数组
   * - avatar：用户头像信息，读取整行的 userId / nickName / userName / avatar 等字段
   * - listExpand：折叠展示字符串或对象列表，参数通过 cellProps 配置
   */
  type?: TableEntityCellType;
  /** 字典编码，type 为 dict 时使用 */
  dictCode?: string;
  /** 同 dictCode，兼容 dict-tag 的旧命名 */
  dictType?: string;
  /** 最多展示的缩略图 / 文件图标数量，type 为 picture 或 file 时使用，默认 3 */
  maxPreviewCount?: number;
  /** 内置单元格组件透传属性，picture 会继续透传给 ImageList */
  cellProps?: Record<string, any>;
  /** 兼容使用 props 作为内置单元格透传配置 */
  props?: Record<string, any>;
  /** 是否允许点击表头进行服务端排序 */
  sortable?: boolean;
  /** 初始排序方向 */
  sortOrder?: TableEntitySortOrder;
  /** 按日期展示单元格。date 为 YYYY-MM-DD，datetime 含时分秒 */
  valueType?: 'date' | 'datetime';
} & Omit<Column, 'dataKey' | 'type' | 'width'>;
export type TableEntityCellType =
  | 'avatar'
  | 'dict'
  | 'file'
  | 'listExpand'
  | 'picture'
  | 'price';

export type TableEntityRowKey = number | string | symbol;
export type TableEntitySortOrder = 'asc' | 'desc';
export type TableEntityChangePayload = {
  current_page: number;
  page?: number;
  per_page: number;
  sortField?: string;
  sortOrder?: TableEntitySortOrder;
};
export type TableEntityQueryParams = Record<string, any>;
export type TableEntityDataResult = {
  rows: Record<string, any>[];
  total: number;
};
export type TableEntityDataFetcher = (params: {
  current_page: number;
  page?: number;
  per_page: number;
  query?: TableEntityQueryParams;
  sortField?: string;
  sortOrder?: TableEntitySortOrder;
}) => Promise<TableEntityDataResult>;

/** ****************************** 列宽拖拽 ********************************/

export type ColumnResizeState = {
  /** 正在拖拽的列 key */
  activeKey: null | string;
  /** 拖拽起始 X 坐标 */
  startX: number;
  /** 拖拽起始列宽 */
  startWidth: number;
};

/** ****************************** 列插槽作用域 ********************************/

// 插槽名：`{dataKey}Col`，与列 dataKey 对应
export type TableEntityColSlotProps = {
  row: Record<string, any>;
  value: unknown;
  cellData: unknown;
  column: ColumnsItem;
  rowIndex: number;
};

/** ****************************** 操作列 ********************************/

/** 内置操作列支持的按钮 */
export type TableEntityActionName = 'copy' | 'delete' | 'edit' | 'view';

/** 操作列按钮配置 */
export type TableEntityActionConfig = {
  name: TableEntityActionName;
  label: string;
  type?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
};

/** 自定义追加的操作按钮 */
export type TableEntityPushAction = {
  /** 唯一标识，无 component 时用于 emit 回传 */
  name?: string;
  /** 按钮文字，无 component 时生效 */
  label?: string;
  /** 按钮颜色类型，无 component 时生效，默认 'primary' */
  type?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
  /**
   * 自定义渲染，传入后忽略 name/label/type。
   * - 传入 Vue 组件：接收 `{ row }` props，组件自行处理事件
   * - 传入函数：签名为 `(ctx: { row }) => VNode`
   */
  component?: ((ctx: { row: Record<string, any> }) => VNode) | Component;
};

/** 操作列点击事件载荷 */
export type TableEntityActionPayload = {
  action: string;
  row: Record<string, any>;
};

/** ****************************** 组件 Props ********************************/

/** 导入弹窗（ImportDialog）配置：import-dialog 需要传入什么，就在这里传什么（弹窗显隐由表格内部控制，故不含 modelValue） */
export type TableEntityImportDialogConfig = Omit<
  ImportDialogProps,
  'modelValue'
>;

export type TableEntlty = {
  columns?: ColumnsItem[];
  data?: Record<string, any>[] | TableEntityDataFetcher;
  height?: number;
  rowHeight?: number;
  /** 虚拟列表在可视区外预渲染的行数，值越小滚动渲染压力越低 */
  cache?: number;
  width?: number;
  selectable?: boolean;
  multiple?: boolean;
  rowKey?: string;
  selectedKeys?: any[];
  tree?: boolean;
  treeChildrenKey?: string;
  expandColumnKey?: string;
  expandedRowKeys?: TableEntityRowKey[];
  defaultExpandedRowKeys?: TableEntityRowKey[];
  indentSize?: number;
  iconSize?: number;
  total?: number;
  per_page?: number;
  current_page?: number;
  query?: TableEntityQueryParams;
  showPagination?: boolean;
  /** 是否显示内置操作列 */
  showActions?: boolean;
  /** @deprecated 操作超过一个时会统一收进更多菜单，仅为兼容保留 */
  maxVisibleActions?: number;
  /** 操作列宽度配置（当前操作列固定为 50px） */
  actionColumnWidth?: number;
  /** 操作列标题，默认 '操作' */
  actionColumnTitle?: string;
  /** 要显示的操作按钮，默认 ['view', 'edit', 'copy', 'delete'] */
  actions?: TableEntityActionName[];
  /** 自定义操作按钮，追加到内置按钮之后 */
  pushActions?: TableEntityPushAction[];
  /** 是否允许拖拽行排序，默认 false。树形表格不生效 */
  rowDraggable?: boolean;
  /**
   * 拖拽把手选择器，限定在行内部。
   * 不传时表格会插入一列拖拽把手。
   */
  rowDragHandle?: string;
  /** 返回 true 的行不可拖动，也不能作为放置目标 */
  rowDragDisabled?: (row: Record<string, any>) => boolean;
  /** 是否允许拖拽调整列宽，默认 false */
  resizable?: boolean;
  /** 列宽最小值，默认 50 */
  minColumnWidth?: number;
  /** 是否显示列设置面板（排序/显隐），默认 false */
  showColumnSettings?: boolean;
  permissionCode?: string;
  /** 导入弹窗配置：传入后点击“导入”按钮打开 ImportDialog 弹窗 */
  importDialog?: TableEntityImportDialogConfig;
};

export type TableEntityRowSortPayload = {
  newIndex: number;
  oldIndex: number;
  rows: Record<string, any>[];
};

export type TableEntityExpose = {
  clearSelection: () => void;
  getSelectedRows: () => Record<string, any>[];
  getSelectedCount: () => number;
  setSelectedKeys: (keys: any[]) => void;
  openImport: () => boolean;
  reload: (page?: number) => Promise<void>;
};
