import type { ColumnsItem } from '../index.type';

import { formatDate, formatDateTime } from '@/runtime/utils';

/** ****************************** 列插槽命名 ********************************/

// `{dataKey}Col`，与模板插槽名一致
export function colSlotName(dataKey: string): string {
  return `${dataKey}Col`;
}

const CREATE_TIME_FIELDS = [
  'create_time',
  'createTime',
  'created_at',
  'createdAt',
  'created_time',
] as const;

const UPDATE_TIME_FIELDS = [
  'update_time',
  'updateTime',
  'updated_at',
  'updatedAt',
  'updated_time',
] as const;

function isBlank(value: unknown) {
  return value === undefined || value === null || value === '';
}

function timeFieldAliases(dataKey: string) {
  if ((CREATE_TIME_FIELDS as readonly string[]).includes(dataKey)) {
    return CREATE_TIME_FIELDS;
  }
  if ((UPDATE_TIME_FIELDS as readonly string[]).includes(dataKey)) {
    return UPDATE_TIME_FIELDS;
  }
  return [];
}

/** 日期列在声明字段为空时，再按常见的创建/更新时间字段名取值 */
export function readDateCellValue(
  row: Record<string, any> | undefined,
  dataKey: string,
  cellData: unknown,
) {
  const direct = cellData === undefined ? row?.[dataKey] : cellData;
  if (!isBlank(direct) || !row) return direct;

  for (const key of timeFieldAliases(dataKey)) {
    if (key === dataKey) continue;
    const value = row[key];
    if (!isBlank(value)) return value;
  }
  return direct;
}

export function formatColumnValue(
  value: unknown,
  valueType?: ColumnsItem['valueType'],
): string {
  if (isBlank(value)) return '--';
  if (valueType === 'datetime') return formatDateTime(value);
  if (valueType === 'date') return formatDate(value);
  return formatCellText(value);
}

// 无插槽时的单元格文本展示
export function formatCellText(v: unknown): string {
  if (v == null || v === '') return '--';
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}
