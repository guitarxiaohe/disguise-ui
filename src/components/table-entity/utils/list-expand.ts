import type { ColumnsItem } from '../index.type';

export function listExpandColumnKey(column: {
  dataIndex?: ColumnsItem['dataIndex'];
  dataKey?: ColumnsItem['dataKey'];
  key?: ColumnsItem['key'];
}) {
  return String(column.key ?? column.dataKey ?? column.dataIndex ?? '');
}

export function listExpandStateKey(rowId: unknown, columnKey: string) {
  return `${String(rowId)}::${columnKey}`;
}

/** 把单元格的值收成可展示的文案列表。 */
export function toListExpandLabels(
  value: unknown,
  labelKey = 'name',
): string[] {
  const list = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean)
      : value == null || value === ''
        ? []
        : [value];

  return list
    .map((item) => {
      if (item == null || item === '') return '';
      if (typeof item !== 'object') return String(item);
      const record = item as Record<string, any>;
      const labeled = record[labelKey];
      if (labeled != null && labeled !== '') return String(labeled);
      return String(
        record.name ??
          record.title ??
          record.product_name ??
          record.description?.name ??
          record.product?.description?.name ??
          record.product?.name ??
          record.sku ??
          '',
      );
    })
    .filter(Boolean);
}
