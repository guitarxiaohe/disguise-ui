import type { Component, VNode } from 'vue';

import type {
  DrawerFormPageProps,
  DrawerFormValues,
} from '../drawer-form-page/index.type';
import type { ImportDialogUrlConfig } from '../import-dialog/index.type';
import type {
  SchemaFormField,
  SchemaFormGroup,
  SchemaFormMode,
} from '../schema-form/schema-form.type';
import type {
  SearchFormItem,
  SearchFormValues,
} from '../search-form/index.type';
import type {
  ColumnsItem,
  TableEntityActionName,
  TableEntlty,
} from '../table-entity/index.type';

type CrudPageMeta = {
  /** 是否出现在抽屉表单中，默认 true */
  form?: boolean;
  /** 是否出现在搜索表单中，true 复用字段配置；对象可覆盖搜索字段或透传控件属性 */
  search?: boolean | Record<string, any>;
};

export type CrudPageSearchFormProps = {
  collapsedRows?: number;
  columns?: number;
  disabled?: boolean;
  labelAlign?: 'center' | 'left' | 'right';
  labelPosition?: 'left' | 'right' | 'top';
  labelWidth?: number | string;
  schema?: SearchFormItem[];
  showActions?: boolean;
};

export type CrudPageSearchSlotProps = {
  /** 当前查询条件，可直接绑定到自定义控件 */
  values: SearchFormValues;
  /** 提交查询条件并刷新表格；不传时使用 values */
  search: (values?: SearchFormValues) => void;
  /** 清空查询条件并刷新表格；可传入自定义默认值 */
  reset: (values?: SearchFormValues) => void;
};

export type CrudPageField =
  | ({
      /** 是否出现在表格中，默认 true；对象可补充表格列配置 */
      table?: boolean | Partial<ColumnsItem>;
    } & CrudPageMeta &
      SchemaFormField)
  | (CrudPageMeta &
      SchemaFormGroup & {
        table?: false;
      });

export type CrudPageItem = CrudPageField;

export type CrudPageRecord = DrawerFormValues;

export type CrudPageCreateHandler = (
  values: CrudPageRecord,
) => boolean | Promise<boolean | void> | void;

export type CrudPageUpdateHandler = (
  values: CrudPageRecord,
  row: CrudPageRecord,
) => boolean | Promise<boolean | void> | void;

export type CrudPageDeleteHandler = (
  row: CrudPageRecord,
) => boolean | Promise<boolean | void> | void;

export type CrudPageFormValuesResolver = (
  mode: SchemaFormMode,
  row?: CrudPageRecord,
) => CrudPageRecord | Promise<CrudPageRecord>;

export type CrudPageBatchDeleteHandler = (
  rows: CrudPageRecord[],
) => boolean | Promise<boolean | void> | void;

export type OnExport = {
  rows: CrudPageRecord[];
  queryParmas: SearchFormValues;
};
export type CrudPageBatchExportHandler = (a: OnExport) => Record<string, any>;

export type ExportConfig = {
  url: string;
  name: string;
  method?: string;
  onExport: CrudPageBatchExportHandler;
};

export type CrudPageToolbarHandler = () =>
  | boolean
  | Promise<boolean | void>
  | void;

/** 工具栏追加按钮配置 */
export type CrudPageToolbarAction = {
  /** 唯一标识，无 component 时用于 toolbar-action 回传 */
  name?: string;
  /** 按钮文字，无 component 时生效 */
  label?: string;
  /** 按钮颜色类型，无 component 时生效，默认 'primary' */
  type?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
  /**
   * 自定义渲染，传入后忽略 name/label/type。
   * - 传入 Vue 组件：不接收 props，组件自行处理事件
   * - 传入函数：签名为 `() => VNode`
   */
  component?: (() => VNode) | Component;
};

export type CrudPageProps = {
  fields?: CrudPageItem[];
  data?: TableEntlty['data'];
  rowKey?: string;
  actions?: TableEntityActionName[];
  /** 追加到新增、删除、导入、导出之后的工具栏按钮 */
  pushToolbarActions?: CrudPageToolbarAction[];
  createTitle?: string;
  editTitle?: string;
  viewTitle?: string;
  addButtonText?: string;
  permissionCode?: string;
  /** 是否显示导入按钮 */
  showImport?: boolean;
  /** 是否显示导出按钮 */
  showExport?: boolean;
  /** 导入接口配置，传入后自动使用内置 ImportDialog */
  importUrl?: ImportDialogUrlConfig | string;
  /** 导出接口地址，传入后点击导出按钮自动下载文件 */
  exportUrl?: string;
  defaultValues?: CrudPageRecord;
  confirmDelete?: boolean;
  deleteConfirmText?: ((row: CrudPageRecord) => string) | string;
  tableProps?: Partial<Omit<TableEntlty, 'columns' | 'data' | 'rowKey'>>;
  searchFormProps?: CrudPageSearchFormProps;
  drawerProps?: Partial<
    Omit<
      DrawerFormPageProps,
      'formValues' | 'mode' | 'modelValue' | 'schema' | 'title'
    >
  >;
  onCreate?: CrudPageCreateHandler;
  onUpdate?: CrudPageUpdateHandler;
  onDelete?: CrudPageDeleteHandler;
  onBatchDelete?: CrudPageBatchDeleteHandler;
  // onExport?: CrudPageToolbarHandler;
  exportConfig?: ExportConfig | undefined;
  /** 编辑或查看时，可从服务端补充详情字段 */
  resolveFormValues?: CrudPageFormValuesResolver;
};
