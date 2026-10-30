import { loadDictData } from './context';

/******************************** 字典 ********************************/

export const DICT_DATA_ALL_QUERY_KEY = ['disguise-ui', 'dict', 'all'];

export interface DictValueItem {
  id?: number | string;
  code?: string;
  name?: string;
  color?: string;
  description?: string;
  status?: boolean | number;
  dictCode?: string;
  cssClass?: string;
  dictLabel?: string;
  dictType?: string;
  dictValue?: string;
  dict?: {
    code: string;
  };
}

/**
 * 读取宿主注入的全量字典。未注入时返回空对象。
 */
export function fetchAllDictData() {
  return loadDictData();
}
