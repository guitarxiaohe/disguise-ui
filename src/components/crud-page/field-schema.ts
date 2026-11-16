import type {
  FieldPropsResolver,
  SchemaFormItem,
} from '../schema-form/schema-form.type';
import type { SearchFormItem } from '../search-form/index.type';
import type { CrudPageField } from './index.type';

const SEARCH_FIELD_KEYS = new Set([
  'apiOptions',
  'anchor',
  'children',
  'component',
  'copyable',
  'defaultValue',
  'description',
  'dictCode',
  'disabled',
  'hidden',
  'hideOnCreate',
  'hideOnEdit',
  'label',
  'newRow',
  'options',
  'optionSource',
  'placeholder',
  'props',
  'readonly',
  'required',
  'rules',
  'span',
  'tip',
  'translateConfig',
  'type',
]);

type FieldProps = FieldPropsResolver | Record<string, any> | undefined;

/** 延迟到 SchemaForm 渲染时解析，所有回调共享当前表单的完整上下文。 */
function mergeFieldProps(...layers: FieldProps[]): FieldProps {
  const configured = layers.filter((layer) => layer !== undefined);
  if (configured.length === 0) return undefined;
  if (configured.length === 1) return configured[0];

  if (configured.some((layer) => typeof layer === 'function')) {
    return (ctx) =>
      Object.assign(
        {},
        ...configured.map((layer) =>
          typeof layer === 'function' ? layer(ctx) : layer,
        ),
      );
  }
  return Object.assign({}, ...configured);
}

export function resolveFormField(field: CrudPageField): null | SchemaFormItem {
  const { form, search: _search, table: _table, ...base } = field;
  if (form === false) return null;
  if (typeof form !== 'object') return base;
  if (base.type === 'group') return { ...base, ...form } as SchemaFormItem;

  return {
    ...base,
    ...form,
    props: mergeFieldProps(
      base.props,
      'props' in form ? form.props : undefined,
    ),
  } as SchemaFormItem;
}

export function resolveSearchField(
  field: CrudPageField,
): null | SearchFormItem {
  const { form: _form, search, table: _table, ...base } = field;
  if (!search) return null;
  const override = typeof search === 'object' ? search : {};
  const fieldConfig = Object.fromEntries(
    Object.entries(override).filter(([key]) => SEARCH_FIELD_KEYS.has(key)),
  );

  if (base.type === 'group') {
    return {
      ...base,
      ...fieldConfig,
      children: Array.isArray(override.children)
        ? override.children
        : base.children,
      hidden: override.hidden ?? false,
    } as SearchFormItem;
  }

  const controlProps = Object.fromEntries(
    Object.entries(override).filter(([key]) => !SEARCH_FIELD_KEYS.has(key)),
  );
  return {
    ...base,
    ...fieldConfig,
    props: mergeFieldProps(
      base.props,
      Object.keys(controlProps).length ? controlProps : undefined,
      'props' in override ? (override.props as FieldProps) : undefined,
    ),
    hidden: override.hidden ?? false,
    readonly: override.readonly ?? false,
    required: override.required ?? false,
    rules: override.rules ?? [],
  } as SearchFormItem;
}
