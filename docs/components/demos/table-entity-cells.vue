<script setup lang="ts">
import { TableEntity } from 'disguise-ui';
import type { ColumnsItem } from 'disguise-ui';

const columns: ColumnsItem[] = [
  {
    title: '状态',
    dataKey: 'status',
    key: 'status',
    width: 100,
    type: 'dict',
    dictCode: 'sys_status',
  },
  {
    title: '用户',
    dataKey: 'createBy',
    key: 'createBy',
    width: 180,
    type: 'avatar',
  },
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
    // cellProps 支持函数形式，入参带出当前行数据，按行返回配置
    cellProps: ({ row }) => ({
      unit: '$',
      oldPrice: 'oldPrice',
      oldPriceStyle: row.oldPrice > 20 ? { fontSize: '10px' } : {},
    }),
  },

  {
    title: '负责任',
    dataKey: 'by',
    key: 'by',
    width: 220,
    type: 'avatar',
    cellProps: ({ row }) => ({
      nickName: '1212',
      username: '1212',
    }),
  },
];

const data = [
  {
    id: 1,
    status: '1',
    userId: 1,
    // nickName: '张三',
    // userName: 'zhangsan',
    sex: '1',
    deptName: '研发部',
    images: ['/logo.svg'],
    oldPrice: 15,
    tags: ['Vue', 'Element Plus', '表格', '表单'],
    price: 13,
    files: ['../../public/test.pdf', '../../public/test2.pdf'],
    by: 1,
  },
  {
    oldPrice: 23,
    style: {
      fontSize: '10px',
    },
    id: 2,
    status: '0',
    userId: 2,
    nickName: '李四',
    userName: 'lisi',
    sex: '2',
    deptName: '设计部',
    images: ['/logo.svg', '/logo.svg'],
    tags: ['Figma'],
    price: 13,
    by: 1,
    files: [
      '../../public/test.pdf',
      '../../public/test2.pdf',
      '../../public/test2.pdf',
      '../../public/test2.pdf',
      '../../public/test2.pdf',
    ],
  },
];
</script>

<template>
  <TableEntity
    :data="data"
    :columns="columns"
    :height="240"
    :selectable="false"
    :show-actions="false"
    :show-pagination="false"
  />
</template>
