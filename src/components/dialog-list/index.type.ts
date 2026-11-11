import type { ColumnsItem } from '../table-entity/index.type';

/** 列配置，在 ColumnsItem 基础上增加搜索元数据 */
export type DialogListColumn = ColumnsItem & {
  /**
   * 搜索表单项配置，直接写 SearchForm 字段配置（如 { type: 'select', ... }）。
   * prop/label 默认取列的 dataIndex（或 dataKey）/title；
   * 未列入搜索字段配置键的其它键会合并进控件 props（与 CrudPage 的 search 元数据一致）。
   * 不写 type 时默认 'text'。
   */
  search?: Record<string, any>;
};

export type DialogListFetchParams = {
  page: number;
  per_page: number;
  /** filterParams 与搜索值的合并结果（同名时搜索值覆盖 filterParams） */
  params?: Record<string, any>;
};

export type DialogListFetchResult = {
  items: Record<string, any>[];
  total: number;
};
