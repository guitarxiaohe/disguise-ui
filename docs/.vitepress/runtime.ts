import { paginateLocally, registerEntity, setupDisguise } from 'disguise-ui';

import { mockDepartments, mockDictData } from './mock';

export function setupDocsRuntime() {
  setupDisguise({
    locale: 'zh-CN',
    imageBaseUrl: '',
    cardShadow: 'hover',
    hasAccess: () => true,
    getAccessToken: () => '',
    fetchAllDictData: async () => mockDictData,
    uploadFile: async (file, options) => {
      options?.onProgress?.(100);
      return { url: URL.createObjectURL(file), cache_url: URL.createObjectURL(file) };
    },
  });

  registerEntity({
    key: 'dept',
    labelKey: 'name',
    valueKey: 'id',
    subtitleKey: 'leader',
    dialogTitle: '选择部门',
    columns: [
      { title: '部门名称', dataKey: 'name', key: 'name', width: 180 },
      { title: '负责人', dataKey: 'leader', key: 'leader', width: 120 },
    ],
    fetch: async (params) => paginateLocally(mockDepartments, params, ['name', 'leader']),
  });
}
