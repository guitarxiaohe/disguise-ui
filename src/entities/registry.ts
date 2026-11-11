import type { DialogListColumn } from '@/components/dialog-list/index.type';

/** ****************************** 类型 ********************************/

export type EntityFetchParams = {
  keyword?: string;
  page: number;
  per_page: number;
  params?: Record<string, any>;
  /** AsyncSelect 回显已选项时传入，接口应按 valueKey 对应字段过滤。 */
  selectedValues?: Array<number | string>;
};

export type EntityFetchResult = {
  items: Record<string, any>[];
  total: number;
};

/**
 * 实体定义：把一个业务键（如 'dept'）映射到取数函数与展示字段，
 * 供 schema-form 的 async-select 字段按 entityKey 查表使用。
 */
export type EntityDefinition = {
  /** 弹窗列表的列配置，可附带 `search` 搜索元数据（生成弹窗内的搜索表单） */
  columns?: DialogListColumn[];
  dialogTitle?: string;
  fetch: (params: EntityFetchParams) => Promise<EntityFetchResult>;
  key: string;
  labelKey: string;
  subtitleKey?: string;
  valueKey: string;
};

/** ****************************** 注册表 ********************************/

const entities = new Map<string, EntityDefinition>();

export function registerEntity(definition: EntityDefinition) {
  entities.set(definition.key, definition);
}

export function getEntity(key: string): EntityDefinition | undefined {
  return entities.get(key);
}

/** ****************************** 工具 ********************************/

/** @deprecated 远程实体应由接口按 page/per_page 分页；仅保留给纯本地数据。 */
export function paginateLocally(
  rows: Record<string, any>[],
  { keyword, page, per_page }: EntityFetchParams,
  searchKeys: string[],
): EntityFetchResult {
  const kw = keyword?.trim().toLowerCase();
  const items = kw
    ? rows.filter((row) =>
        searchKeys.some((key) =>
          String(row[key] ?? '')
            .toLowerCase()
            .includes(kw),
        ),
      )
    : rows;
  return {
    items: items.slice((page - 1) * per_page, page * per_page),
    total: items.length,
  };
}
