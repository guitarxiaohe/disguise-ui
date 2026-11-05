import { ElColorPicker } from 'element-plus';

import { registerSchemaFormComponents } from 'disguise-ui';
import type { CrudPageField } from 'disguise-ui';

registerSchemaFormComponents({
  ColorPicker: ElColorPicker,
});

/**
 * CrudPage 全量示例的字段元数据：
 * - 顶层字段参与表格列（可加 `search: true` 生成搜索项）
 * - 分组只进抽屉表单，补齐 SchemaForm 其余控件类型
 */
export const crudFullFields: CrudPageField[] = [
  {
    prop: 'name',
    label: '名称',
    type: 'text',
    required: true,
    search: true,
    table: { width: 100 },
  },
  {
    prop: 'status',
    label: '状态',
    type: 'radio',
    optionSource: 'dict',
    dictCode: 'sys_status',
    defaultValue: '1',
    search: true,
    table: { width: 90, type: 'dict', dictCode: 'sys_status' },
  },
  {
    prop: 'job',
    label: '岗位',
    type: 'select',
    optionSource: 'dict',
    dictCode: 'sys_job',
    defaultValue: null,
    search: true,
    table: { width: 90, type: 'dict', dictCode: 'sys_job' },
  },
  {
    prop: 'deptId',
    label: '部门',
    type: 'async-select',
    apiOptions: { entityKey: 'dept' },
    defaultValue: null,
    search: true,
    table: { width: 110, dataKey: 'deptName' },
  },
  {
    prop: 'region',
    label: '区域',
    type: 'cascader',
    defaultValue: null,
    search: true,
    table: false,
    props: {
      options: [
        {
          value: 'zj',
          label: '浙江',
          children: [
            {
              value: 'hz',
              label: '杭州',
              children: [{ value: 'xh', label: '西湖区' }],
            },
            { value: 'nb', label: '宁波' },
          ],
        },
        {
          value: 'js',
          label: '江苏',
          children: [{ value: 'nj', label: '南京' }],
        },
      ],
    },
  },
  {
    prop: 'userName',
    label: '用户名',
    type: 'text',
    table: {
      width: 160,
      type: 'avatar',
      cellProps: ({ row }) => ({
        nickName: row.nickName,
        userName: row.userName,
        age: '99',
        avatar:
          'https://rh-international.oss-us-east-1.aliyuncs.com/attachment/v3/a-14.jpg',
        deptName: 'dev',
        email: 'he12205227953@gmail.com',
        nickName: '测试跟单客服',
        phone: '18163203256',
        workYears: 'workYears',
        jobLevel: 'jobLevel',
        subtitle: 'subtitle',
        postNames: [],
        roleNames: ['test'],
        sex: '1',
        userId: 5,
        avatar:
          'https://rh-international.oss-us-east-1.aliyuncs.com/attachment/v3/20260811_111411-13.png',
      }),
    },
  },

  {
    prop: 'sort',
    label: '排序',
    type: 'number',
    defaultValue: 0,
    table: { width: 80 },
  },
  {
    prop: 'tags',
    label: '标签',
    type: 'checkbox',
    defaultValue: [],
    options: [
      { label: 'Vue', value: 'Vue' },
      { label: 'Element Plus', value: 'Element Plus' },
      { label: '表格', value: '表格' },
      { label: '表单', value: '表单' },
    ],
    table: { width: 190, type: 'listExpand', cellProps: { max: 2 } },
  },
  {
    prop: 'onlineDate',
    label: '上架日期',
    type: 'date',
    table: { width: 120, valueType: 'date' },
  },
  {
    prop: 'publishAt',
    label: '发布时间',
    type: 'datetime',
    table: { width: 160, valueType: 'datetime' },
  },
  {
    prop: 'cover',
    label: '封面',
    type: 'picture',
    table: { width: 100, type: 'picture' },
  },
  {
    prop: 'files',
    label: '附件',
    type: 'file',
    table: { width: 130, type: 'file', maxPreviewCount: 2 },
  },
  {
    prop: 'price',
    label: '价格',
    type: 'number',
    table: {
      width: 110,
      type: 'price',
      cellProps: { unit: '¥', oldPrice: 'oldPrice' },
    },
  },
  {
    type: 'group',
    label: '基本信息',
    description: '开关、多行文本与字典性别',
    anchor: true,
    children: [
      {
        prop: 'enabled',
        label: '启用',
        type: 'switch',
        defaultValue: true,
      },
      {
        prop: 'sex',
        label: '性别',
        type: 'select',
        optionSource: 'dict',
        dictCode: 'sys_user_sex',
        defaultValue: null,
      },
      {
        prop: 'summary',
        label: '简介',
        type: 'textarea',
        span: 24,
        props: { maxlength: 120, showWordLimit: true },
      },
    ],
  },
  {
    type: 'group',
    label: '选项与自定义',
    description: '静态下拉、注册组件与插槽字段',
    anchor: true,
    children: [
      {
        prop: 'channel',
        label: '渠道',
        type: 'select',
        defaultValue: 'online',
        options: [
          { label: '线上', value: 'online' },
          { label: '线下', value: 'offline' },
        ],
      },
      {
        prop: 'themeColor',
        label: '主题色',
        type: 'component',
        component: 'ColorPicker',
        defaultValue: '#409EFF',
      },
      {
        prop: 'score',
        label: '评分',
        type: 'slot',
        defaultValue: 4,
      },
    ],
  },
  {
    type: 'group',
    label: '媒体与详情',
    description: '附件上传与富文本',
    anchor: true,
    children: [
      {
        prop: 'manual',
        label: '说明书',
        type: 'file',
        props: { maxCount: 2, accept: ['.pdf', '.doc', '.docx'] },
      },
      {
        prop: 'attachment',
        label: '通用附件',
        type: 'upload',
        props: { maxCount: 3 },
      },
      {
        prop: 'detail',
        label: '详情',
        type: 'rich-text',
        span: 24,
      },
    ],
  },
];
