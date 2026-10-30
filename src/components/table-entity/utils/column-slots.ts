import type { Slots } from 'vue';

import type { ColumnsItem } from '../index.type';

import { defineAsyncComponent, h } from 'vue';

import DictTag from '@/components/dict-tag/index.vue';
import { useImageUrl } from '@/composables/use-image-url';

import { PriceCell } from '../cells';
import ListExpandCell from '../cells/list-expand-cell.vue';
const FileCell = defineAsyncComponent(() => import('../cells/file-cell.vue'));

const PictureCell = defineAsyncComponent(
  () => import('../cells/picture-cell.vue'),
);

const UserCell = defineAsyncComponent(() => import('../cells/avatar-cell.vue'));
import {
  colSlotName,
  formatColumnValue,
  readDateCellValue,
} from './column-utils';
import {
  listExpandColumnKey,
  listExpandStateKey,
  toListExpandLabels,
} from './list-expand';

export type ColumnSlotListExpand = {
  expandedKeys: Set<string>;
  onToggle: (key: string) => void;
  rowKey: string;
};

const { resolveImageUrl } = useImageUrl();

/** 将图片列的值统一转换为可访问的 URL 数组。 */
function toPictureUrls(value: unknown): string[] {
  if (value == null || value === '') return [];
  const list = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [value];

  return list
    .map((item) =>
      item && typeof item === 'object'
        ? ((item as Record<string, any>).fileUrl ??
          (item as Record<string, any>).url)
        : item,
    )
    .map((item) => resolveImageUrl(item))
    .filter(Boolean);
}

const isFiles = (value: any) => {
  if (Array.isArray(value)) {
    return value.map((t) => ({
      fileUrl: t,
    }));
  } else {
    return {
      fileUrl: value,
    };
  }
};

/** 按列 type 渲染内置单元格组件，未命中时返回 undefined。 */
function renderBuiltinCell(
  column: ColumnsItem,
  rowData: Record<string, any>,
  value: unknown,
  listExpand?: ColumnSlotListExpand,
) {
  const maxPreviewCount = column.maxPreviewCount ?? 3;
  const cellProps = column.cellProps ?? column.props ?? {};

  switch (column.type) {
    case 'avatar': {
      return h(UserCell, { row: rowData, value: value as any });
    }
    case 'file': {
      return h(FileCell, {
        ...cellProps,
        attachments: isFiles(value) as any,
        maxPreviewCount,
      });
    }
    case 'picture': {
      return h(PictureCell, {
        ...cellProps,
        urls: toPictureUrls(value),
        maxPreviewCount,
      });
    }
    case 'price': {
      return h(PriceCell, {
        ...cellProps,
        price: String(value || '0'),
        lodPrice: rowData[cellProps?.lodPrice] ?? '请查看配置项',
      });
    }
    case 'listExpand': {
      const stateKey = listExpandStateKey(
        rowData?.[listExpand?.rowKey ?? 'id'],
        listExpandColumnKey(column),
      );
      return h(ListExpandCell, {
        items: toListExpandLabels(value, cellProps.labelKey),
        max: cellProps.max,
        unit: cellProps.unit,
        expanded: listExpand?.expandedKeys.has(stateKey) ?? false,
        onToggle: () => listExpand?.onToggle(stateKey),
      });
    }
    default: {
      return undefined;
    }
  }
}

/** ****************************** 列 cell 与插槽合并 ********************************/

/** 将列元数据中的垂直对齐方式转换为 cell 根节点的 flex 对齐方式。 */
function getVerticalAlignStyle(column: ColumnsItem) {
  const alignSelf = {
    bottom: 'flex-end',
    center: 'center',
    top: 'flex-start',
  } as const;
  const verticalAlign = column.verticalAlign;

  return verticalAlign
    ? {
        alignSelf: alignSelf[verticalAlign],
        width: '100%',
      }
    : undefined;
}

// 为每列包一层 cellRenderer：插槽优先，否则展示纯文本
export function applyColumnSlots(
  cols: ColumnsItem[],
  slots: Slots,
  listExpand?: ColumnSlotListExpand,
): ColumnsItem[] {
  return cols.map((col) => {
    if (col.key === '__sel__' || col.key === '__fill__') return col;

    // 自定义 cellRenderer 也包一层，确保 verticalAlign 对插槽和自定义内容生效。
    if (col.cellRenderer) {
      const originalCellRenderer = col.cellRenderer;
      const verticalAlignStyle = getVerticalAlignStyle(col);
      if (!verticalAlignStyle) return col;

      return {
        ...col,
        cellRenderer: (ctx: Parameters<typeof originalCellRenderer>[0]) =>
          h(
            'div',
            {
              class: 'table-entity__cell',
              style: verticalAlignStyle,
            },
            originalCellRenderer(ctx),
          ),
      };
    }

    const dk = col.dataKey;
    if (dk == null || dk === '') return col;

    const name = colSlotName(String(dk));

    return {
      ...col,
      cellRenderer: (ctx: {
        rowData: Record<string, any>;
        rowIndex: number;
        cellData: unknown;
        column: ColumnsItem;
      }) => {
        const { rowData, rowIndex, cellData } = ctx;
        const currentColumn = ctx.column ?? col;
        const currentAlign = currentColumn.align ?? col.align ?? 'left';
        const verticalAlignStyle = getVerticalAlignStyle(currentColumn);
        const valueType = currentColumn.valueType ?? col.valueType;
        const value =
          valueType === 'date' || valueType === 'datetime'
            ? readDateCellValue(rowData, String(dk), cellData)
            : cellData === undefined
              ? rowData?.[dk as string]
              : cellData;
        const text = formatColumnValue(value, valueType);
        const slotTitle =
          value !== null && typeof value === 'object' ? undefined : text;

        const slotFn = slots[name];
        if (slotFn) {
          return h(
            'div',
            {
              class: 'table-entity__col-slot',
              title: slotTitle,
              style: {
                textAlign: currentAlign,
                ...verticalAlignStyle,
              },
            },
            slotFn({
              row: rowData,
              value,
              cellData: value,
              column: currentColumn,
              rowIndex,
            }),
          );
        }
        const builtinCell = renderBuiltinCell(
          currentColumn,
          rowData,
          value,
          listExpand,
        );
        if (builtinCell) {
          const isPicture =
            currentColumn.type === 'picture' || col.type === 'picture';
          const isListExpand =
            currentColumn.type === 'listExpand' || col.type === 'listExpand';
          return h(
            'div',
            {
              class: isListExpand
                ? 'table-entity__list-expand'
                : 'table-entity__col-slot',
              style: {
                textAlign: currentAlign,
                ...(isPicture
                  ? {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        currentAlign === 'center'
                          ? 'center'
                          : currentAlign === 'right'
                            ? 'flex-end'
                            : 'flex-start',
                    }
                  : {}),
                ...verticalAlignStyle,
              },
            },
            builtinCell,
          );
        }
        if (value === undefined || value === null || value === '') {
          return h(
            'span',
            {
              class: 'table-entity__col-text',
              title: text,
              style: {
                textAlign: currentAlign,
                ...verticalAlignStyle,
              },
            },
            text,
          );
        }
        if (currentColumn.type === 'dict') {
          const dictCode =
            currentColumn.dictCode ?? currentColumn.dictType ?? '';
          return h(
            'div',
            {
              class: 'table-entity__col-slot',
              title: text,
              style: {
                textAlign: currentAlign,
                ...verticalAlignStyle,
              },
            },
            h(DictTag, {
              code: dictCode,
              value,
            }),
          );
        }
        return h(
          'span',
          {
            class: 'table-entity__col-text',
            title: text,
            style: {
              textAlign: currentAlign,
              ...verticalAlignStyle,
            },
          },
          text,
        );
      },
    };
  });
}
