<script setup lang="ts">
import { TableEntity } from 'disguise-ui';
import type { ColumnsItem } from 'disguise-ui';

const columns: ColumnsItem[] = [
  { title: '用户', dataKey: 'createBy', key: 'createBy', width: 180, type: 'avatar' },
  {
    title: '封面',
    dataKey: 'images',
    key: 'images',
    width: 160,
    type: 'picture',
    cellProps: { size: 40, maxStack: 2 },
  },
  {
    title: '标签',
    dataKey: 'tags',
    key: 'tags',
    width: 220,
    type: 'listExpand',
    cellProps: { max: 2, unit: '标签' },
  },
];

const data = [
  {
    id: 1,
    userId: 1,
    nickName: '张三',
    userName: 'zhangsan',
    sex: '1',
    deptName: '研发部',
    images: ['/logo.svg'],
    tags: ['Vue', 'Element Plus', '表格', '表单'],
  },
  {
    id: 2,
    userId: 2,
    nickName: '李四',
    userName: 'lisi',
    sex: '2',
    deptName: '设计部',
    images: ['/logo.svg', '/logo.svg'],
    tags: ['Figma'],
  },
];
</script>

<template>
  <TableEntity :data="data" :columns="columns" :height="240" :selectable="false" :show-actions="false" :show-pagination="false" />
</template>
