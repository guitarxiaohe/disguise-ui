/** ****************************** 分页参数 ********************************/

export type AsyncSelectFetchParams = {
  keyword?: string;
  page: number;
  per_page: number;
  params?: Record<string, any>;
};

/** ****************************** 分页结果 ********************************/

export type AsyncSelectFetchResult = {
  items: Record<string, any>[];
  total: number;
};

/** ****************************** 选中值 ********************************/

export type SelectVal = (number | string)[] | null | number | string;
