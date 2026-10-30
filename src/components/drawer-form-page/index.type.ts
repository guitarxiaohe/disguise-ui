import type {
  SchemaFormItem,
  SchemaFormMode,
  SchemaFormProps,
} from '../schema-form/schema-form.type';

export type DrawerFormValues = Record<string, any>;

export type DrawerFormSchemaProps = Omit<
  SchemaFormProps,
  'disabled' | 'loading' | 'mode' | 'schema'
>;

export type DrawerFormPageProps = {
  /** 抽屉显隐 */
  modelValue?: boolean;
  /** 抽屉标题 */
  title?: string;
  /** 标题上方的路径文字 */
  breadcrumb?: string;
  /** 右侧状态文案；不传时根据 mode 自动生成 */
  statusText?: string;
  /** 表单模式 */
  mode?: SchemaFormMode;
  /** SchemaForm 字段配置 */
  schema?: SchemaFormItem[];
  /** 表单值，配合 v-model:form-values 使用 */
  formValues?: DrawerFormValues;
  /** 普通模式下的抽屉宽度 */
  size?: number | string;
  /** 抽屉打开方向 */
  direction?: 'btt' | 'ltr' | 'rtl' | 'ttb';
  /** 是否显示全屏切换按钮 */
  fullscreenButton?: boolean;
  /** 初始是否全屏 */
  fullscreen?: boolean;
  /** 新增、编辑等常规模式下的表单列数；查看模式固定为两列 */
  normalColumns?: number;
  /** 全屏模式下的表单列数 */
  fullscreenColumns?: number;
  /** 是否显示底部操作栏 */
  showFooter?: boolean;
  /** 是否显示取消按钮 */
  showCancelButton?: boolean;
  /** 是否显示提交按钮，查看模式下默认隐藏 */
  showSubmitButton?: boolean;
  cancelText?: string;
  submitText?: string;
  /** 抽屉内容与表单的加载状态 */
  loading?: boolean;
  /** 提交中的状态，会禁用关闭与操作按钮 */
  submitting?: boolean;
  disabled?: boolean;
  destroyOnClose?: boolean;
  closeOnClickModal?: boolean;
  closeOnPressEscape?: boolean;
  appendToBody?: boolean;
  lockScroll?: boolean;
  /** 透传给 ElDrawer 的其他属性 */
  drawerProps?: Record<string, any>;
  /** 透传给 SchemaForm 的布局属性 */
  schemaFormProps?: DrawerFormSchemaProps;
};

export type DrawerFormPageOpenOptions<TValues extends DrawerFormValues> =
  Partial<
    Pick<
      DrawerFormPageProps,
      | 'appendToBody'
      | 'breadcrumb'
      | 'cancelText'
      | 'closeOnClickModal'
      | 'closeOnPressEscape'
      | 'destroyOnClose'
      | 'direction'
      | 'disabled'
      | 'drawerProps'
      | 'fullscreen'
      | 'fullscreenButton'
      | 'fullscreenColumns'
      | 'loading'
      | 'lockScroll'
      | 'mode'
      | 'normalColumns'
      | 'schema'
      | 'schemaFormProps'
      | 'showCancelButton'
      | 'showFooter'
      | 'showSubmitButton'
      | 'size'
      | 'statusText'
      | 'submitText'
      | 'submitting'
      | 'title'
    >
  > & {
    values?: TValues;
  };

export type DrawerFormPageState<TValues extends DrawerFormValues> =
  DrawerFormPageOpenOptions<TValues>;

export type DrawerFormPageApi<TValues extends DrawerFormValues> = {
  open: (options?: DrawerFormPageOpenOptions<TValues>) => void;
  close: () => void;
  toggleFullscreen: () => void;
  setValues: (values: Partial<TValues>) => void;
  getValues: () => TValues;
  validate: () => Promise<boolean>;
  resetFields: () => void;
  submit: () => Promise<boolean>;
  setState: (state: DrawerFormPageState<TValues>) => void;
};

export type DrawerFormPageSubmitHandler<TValues extends DrawerFormValues> = (
  values: TValues,
  api: DrawerFormPageApi<TValues>,
) => boolean | Promise<boolean | void> | void;

export type DrawerFormPageOptions<TValues extends DrawerFormValues> =
  DrawerFormPageOpenOptions<TValues> & {
    initialValues?: TValues;
    closeOnSubmit?: boolean;
    onSubmit?: DrawerFormPageSubmitHandler<TValues>;
    onCancel?: () => void;
    onOpenChange?: (visible: boolean) => void;
  };
