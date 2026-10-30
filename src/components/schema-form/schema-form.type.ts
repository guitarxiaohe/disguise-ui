import type { FormItemRule } from 'element-plus';

import type {
  SchemaFormComponent,
  SchemaFormComponentConfig,
} from './schema-form-registry';

/** ****************************** 基础 ********************************/

export type SchemaFormMode = 'create' | 'edit' | 'view';

export type FieldOption = { flag?: string; label: string; value: any };

export type SchemaFormProps = {
  /** 整体栅格列数，字段可用 span 单独覆盖 */
  columns?: number;
  disabled?: boolean;
  /** 为 true 时输入框只显示下边框；不传则使用全边框 */
  underline?: boolean;
  /** 标签文字在 label 宽度内的对齐 */
  labelAlign?: 'center' | 'left' | 'right';
  /** 表单项之间的纵向间距 */
  itemGap?: number | string;
  /** 分组相对其他表单项额外增加的上下间距 */
  groupGap?: number | string;
  /** 标签与控件之间的间距 */
  labelGap?: number | string;
  /** 标签相对控件的位置 */
  labelPosition?: 'left' | 'right' | 'top';
  labelWidth?: number | string;
  loading?: boolean;
  mode?: SchemaFormMode;
  schema?: SchemaFormItem[];
};

/** 布尔属性的函数形态可以拿到当前模式与全量表单值，用于字段联动 */
export type FieldContext = {
  mode: SchemaFormMode;
  values: Record<string, any>;
};

export type FieldCondition = ((ctx: FieldContext) => boolean) | boolean;
export type FieldOptionsResolver = (ctx: FieldContext) => FieldOption[];
export type FieldPropsContext = FieldContext & {
  updateValue: (value: any) => void;
};
export type FieldPropsResolver = (
  ctx: FieldPropsContext,
) => Record<string, any>;

export type TranslateLanguage = { code: string; label: string };
export type TranslateCommand = 'polish' | 'translate';
export type TranslateLanguageValues = Record<string, unknown>;
export type TranslateHandlerContext = {
  /**
   * 精翻 普翻
   */
  command: TranslateCommand;
  fieldProp: string;
  fieldValue: TranslateLanguageValues;
  sourceLanguage: string;
  sourceValue: unknown;
  targetLanguage: string;
  targetLanguages: string[];
  /** 当前字段的翻译前值；回调返回的对象会与此值合并 */
  before: TranslateLanguageValues;
} & FieldContext;
export const DEFAULT_TRANSLATE_LANGUAGES: TranslateLanguage[] = [
  { code: 'en', label: 'English' },
  { code: 'zh_cn', label: '简体中文' },
  { code: 'ar', label: 'Arabic' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Espanol' },
  { code: 'tr', label: 'Turkish' },
  { code: 'ru', label: 'Русский' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ko', label: '간체 중문' },
  { code: 'ja', label: 'Japanese' },
  { code: 'it', label: 'Italiano' },
  { code: 'fr', label: 'French' },
];
export type TranslateConfig = {
  language?: TranslateLanguage[];
  /** 多语言输入布局；rich-text、text、textarea 默认都使用 tabs */
  layout?: 'grid' | 'tabs';
  /** 未配置时使用显式提示的模拟翻译（复制源文到目标语言） */
  translate?: (
    ctx: TranslateHandlerContext,
  ) =>
    | Partial<TranslateLanguageValues>
    | Promise<Partial<TranslateLanguageValues> | undefined>
    | undefined;
};

export type FieldType =
  | 'async-select'
  | 'checkbox'
  | 'component'
  | 'date'
  | 'datetime'
  | 'file'
  | 'number'
  | 'picture'
  | 'radio'
  | 'rich-text'
  | 'select'
  | 'slot'
  | 'switch'
  | 'text'
  | 'textarea'
  | 'upload';

/** ****************************** 字段 ********************************/

type BaseField = {
  /** 覆盖内置控件，或配合 type: 'component' 使用注册的自定义组件 */
  component?: SchemaFormComponent | SchemaFormComponentConfig | string;
  /** 只读态是否附带复制按钮，默认跟随 readonly */
  copyable?: boolean;
  defaultValue?: any;
  disabled?: FieldCondition;
  /** 新建时隐藏，等价于 hidden: ({ mode }) => mode === 'create' */
  hideOnCreate?: boolean;
  hideOnEdit?: boolean;
  hidden?: FieldCondition;
  /** 顶层字段必填；分组子项可不写，只用于占位符和校验文案 */
  label?: string;
  /** 在 ElRow 中强制另起一行，仍可使用 span 控制宽度 */
  newRow?: boolean;
  placeholder?: string;
  /** 透传给底层控件的额外属性 */
  props?: FieldPropsResolver | Record<string, any>;
  prop: string;
  /** 渲染为纯文本而非输入控件 */
  readonly?: boolean;
  /** 自动生成必填规则，与 rules 合并 */
  required?: FieldCondition;
  rules?: FormItemRule[];
  /** 24 栅格占位，默认按表单的 columns 均分 */
  span?: number;
  /** 控件下方的灰色提示 */
  tip?: string;
  /** 为 text、textarea、rich-text 字段启用多语言编辑 */
  translateConfig?: TranslateConfig;
};

export type ApiFieldOptions = {
  entityKey: string;
  labelKey?: string;
  multiple?: boolean;
  /** 附加查询条件 */
  params?: Record<string, any>;
  subtitleKey?: string;
  valueKey?: string;
};

export type SchemaFormField = BaseField &
  (
    | {
        apiOptions: ApiFieldOptions;
        optionSource?: 'api';
        type: 'async-select';
      }
    | {
        component: SchemaFormComponent | SchemaFormComponentConfig | string;
        type: 'component';
      }
    | {
        dictCode: string;
        optionSource: 'dict';
        type: 'async-select';
      }
    | {
        dictCode: string;
        optionSource: 'dict';
        type: 'checkbox' | 'radio' | 'select';
      }
    | {
        options: FieldOption[] | FieldOptionsResolver;
        optionSource?: 'static';
        type: 'checkbox' | 'radio' | 'select';
      }
    | {
        type:
          | 'date'
          | 'datetime'
          | 'file'
          | 'listExpand'
          | 'number'
          | 'picture'
          | 'rich-text'
          | 'slot'
          | 'switch'
          | 'text'
          | 'textarea'
          | 'upload';
      }
  ) & { label: string };

/** Omit 作用在联合类型上会丢掉各分支特有字段，分组子项必须按成员展开 */
type DistributiveOmit<T, K extends PropertyKey> = T extends any
  ? Omit<T, K>
  : never;

/** ****************************** 分组 ********************************/

/**
 * 一个 label 下并排多个控件（如重量加单位）。容器自身没有 prop，
 * 值仍由 children 平铺在表单对象里，它只负责标签与布局。
 */
export type SchemaFormGroupChild = DistributiveOmit<
  SchemaFormField,
  'label'
> & {
  label?: string;
};

export type SchemaFormGroup = {
  /** 组内控件，按声明顺序横向排列，不支持再嵌套分组 */
  children: SchemaFormGroupChild[];
  /** 锚点分组标题下方的辅助说明 */
  description?: string;
  /** 整组禁用，与子项自身的 disabled 取或 */
  disabled?: FieldCondition;
  hideOnCreate?: boolean;
  hideOnEdit?: boolean;
  hidden?: FieldCondition;
  label: string;
  /** 在长表单顶部显示锚点导航 */
  anchor?: boolean;
  /** 在 ElRow 中强制另起一行，仍可使用 span 控制宽度 */
  newRow?: boolean;
  /** 24 栅格占位，默认按表单的 columns 均分 */
  span?: number;
  tip?: string;
  type: 'group';
};

/** schema 的顶层元素：普通字段或分组容器 */
export type SchemaFormItem = SchemaFormField | SchemaFormGroup;

/**
 * 组件内部使用的宽松形态：联合类型在模板里无法按 optionSource 收窄，
 * 统一在入口处断言一次，避免每个分支重复断言。
 */
export type ResolvedField = BaseField & {
  apiOptions?: ApiFieldOptions;
  dictCode?: string;
  optionSource?: 'api' | 'dict' | 'static';
  options?: FieldOption[] | FieldOptionsResolver;
  type: FieldType;
};

export type ResolvedGroup = Omit<SchemaFormGroup, 'children'> & {
  children: ResolvedField[];
};

export type ResolvedEntry = ResolvedField | ResolvedGroup;

/** ****************************** 插槽 ********************************/

export type SchemaFormSlotProps = {
  disabled: boolean;
  field: ResolvedField;
  updateValue: (value: any) => void;
  value: any;
};
