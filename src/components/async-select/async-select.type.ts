/** ****************************** 分页参数 ********************************/

export type AsyncSelectFetchParams = {
  keyword?: string;
  page: number;
  per_page: number;
  params?: Record<string, any>;
  /** 回显已选项时需要查询的值；远程接口应按值过滤，而不是返回全量数据。 */
  selectedValues?: Array<number | string>;
};

/** ****************************** 分页结果 ********************************/

export type AsyncSelectFetchResult = {
  items: Record<string, any>[];
  total: number;
};

/** AsyncSelect 远程分页取数函数。 */
export type AsyncSelectDataFetcher = (
  params: AsyncSelectFetchParams,
) => Promise<AsyncSelectFetchResult>;

/** ****************************** 选中值 ********************************/

export type SelectVal = (number | string)[] | null | number | string;
