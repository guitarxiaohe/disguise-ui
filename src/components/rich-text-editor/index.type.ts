import type { Editor } from '@tiptap/vue-3';
import type { Component } from 'vue';

/** 富文本工具始终可用的编辑器上下文。 */
export type RichTextToolBaseContext = {
  /** 当前 Tiptap 编辑器实例。 */
  editor: Editor;
  /** 编辑器当前是否允许修改。 */
  editable: boolean;
  /** 调用工具时的最新 HTML。 */
  value: string;
  /** 获取最新 HTML，适合在弹窗或异步流程结束后调用。 */
  getValue: () => string;
  /** 更新编辑器 HTML，并同步触发 v-model。 */
  updateValue: (value: string) => void;
};

/** 自定义工具收到的完整上下文；泛型可由上层组件补充表单信息。 */
export type RichTextToolContext<
  TExtraContext extends object = Record<string, never>,
> = RichTextToolBaseContext & TExtraContext;

export type RichTextToolPredicate<
  TExtraContext extends object = Record<string, never>,
> =
  | boolean
  | ((context: RichTextToolContext<TExtraContext>) => boolean);

type RichTextToolBase<TExtraContext extends object> = {
  /** 工具唯一标识。 */
  key: string;
  /** 按钮提示文案；未提供 icon 时也作为按钮文字。 */
  label: string;
  /** Vue 图标组件。 */
  icon?: Component;
  /** 自定义工具之间的排序值，默认 0；数值越小越靠前。 */
  order?: number;
  /** 是否显示工具。 */
  visible?: RichTextToolPredicate<TExtraContext>;
  /** 是否禁用工具。编辑器不可编辑时，按钮工具始终禁用。 */
  disabled?: RichTextToolPredicate<TExtraContext>;
};

/** 直接在工具栏渲染自定义 Vue 组件。组件会收到 context 与 disabled。 */
export type RichTextComponentTool<
  TExtraContext extends object = Record<string, never>,
> = RichTextToolBase<TExtraContext> & {
  component: Component;
  onClick?: never;
  /** 额外透传给自定义组件的属性。 */
  props?: Record<string, unknown>;
};

/** 渲染为工具栏按钮，点击后调用 onClick。 */
export type RichTextActionTool<
  TExtraContext extends object = Record<string, never>,
> = RichTextToolBase<TExtraContext> & {
  component?: never;
  onClick: (
    context: RichTextToolContext<TExtraContext>,
  ) => Promise<void> | void;
  props?: never;
};

export type RichTextTool<
  TExtraContext extends object = Record<string, never>,
> = RichTextActionTool<TExtraContext> | RichTextComponentTool<TExtraContext>;

export type RichTextEditorProps<
  TExtraContext extends object = Record<string, never>,
> = {
  editable?: boolean;
  maxHeight?: string;
  modelValue?: string;
  placeholder?: string;
  /** 追加到内置工具栏末尾的自定义工具。 */
  richTextTools?: RichTextTool<TExtraContext>[];
  /** 上层组件注入的额外上下文；工具使用时会与编辑器上下文合并。 */
  toolContext?: TExtraContext;
};
