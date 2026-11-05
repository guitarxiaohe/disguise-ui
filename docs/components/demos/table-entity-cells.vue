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
    cellProps: { size: 30, maxStack: 2 },
  },

    {
    title: '文件',
    dataKey: 'files',
    key: 'files',
    width: 160,
    type: 'file',
    cellProps: { size: 30, maxStack: 2 },
  },
  {
    title: '标签',
    dataKey: 'tags',
    key: 'tags',
    width: 220,
    type: 'listExpand',
    cellProps: { max: 2, unit: '标签' },
  },

   {
    title: '金额',
    dataKey: 'price',
    key: 'price',
    width: 220,
    type: 'price',
    cellProps: { unit: '$', oldPrice: 'oldPrice', oldPriceStyle:  { fontSize: '10px' } },
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
    oldPrice: 15,
    tags: ['Vue', 'Element Plus', '表格', '表单'],
      price:13,
      files: [
      '../../public/test.pdf',
      '../../public/test2.pdf',
    ],
  },
  {
        oldPrice: 23,
        style:{
          fontSize:'10px',
        },
    id: 2,
    userId: 2,
    nickName: '李四',
    userName: 'lisi',
    sex: '2',
    deptName: '设计部',
    images: ['/logo.svg', '/logo.svg'],
    tags: ['Figma'],
    price:13,
    files: [
      '../../public/test.pdf',
      '../../public/test2.pdf',
      '../../public/test2.pdf',
      '../../public/test2.pdf',
      '../../public/test2.pdf',
  ]

  },
];
</script>

<template>
  <TableEntity :data="data" :columns="columns" :height="240" :selectable="false" :show-actions="false" :show-pagination="false" />
</template>
