import { ElColorPicker } from 'element-plus';

import { registerSchemaFormComponents } from 'disguise-ui';
import type { SchemaFormItem } from 'disguise-ui';

registerSchemaFormComponents({
  ColorPicker: ElColorPicker,
});

export const drawerFormSchema: SchemaFormItem[] = [
  {
    type: 'group',
    label: '基本信息',
    description: '文本、数字、开关、字典和远程下拉',
    anchor: true,
    children: [
      {
        prop: 'code',
        label: '编号',
        type: 'text',
        hideOnCreate: true,
        readonly: true,
        tip: '新建时隐藏，编辑和查看时只读',
      },
      { prop: 'name', label: '名称', type: 'text', required: true },
      {
        prop: 'sort',
        label: '排序',
        type: 'number',
        defaultValue: 0,
        props: { min: 0, max: 999 },
      },
      {
        prop: 'enabled',
        label: '启用',
        type: 'switch',
        defaultValue: true,
      },
      {
        prop: 'status',
        label: '状态',
        type: 'radio',
        optionSource: 'dict',
        dictCode: 'sys_status',
        defaultValue: '1',
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
        prop: 'job',
        label: '岗位',
        type: 'select',
        optionSource: 'dict',
        dictCode: 'sys_job',
        defaultValue: null,
      },
      {
        prop: 'deptId',
        label: '部门',
        type: 'async-select',
        apiOptions: { entityKey: 'dept' },
        defaultValue: null,
      },
    ],
  },
  {
    type: 'group',
    label: '售卖单位',
    children: [
      {
        prop: 'saleType',
        type: 'select',
        defaultValue: 'piece',
        placeholder: '请选择售卖方式',
        options: [
          { label: '按件卖', value: 'piece' },
          { label: '按批卖', value: 'batch' },
        ],
      },
      {
        prop: 'unit',
        type: 'select',
        defaultValue: 'pcs',
        placeholder: '请选择单位',
        options: [
          { label: '件', value: 'pcs' },
          { label: '箱', value: 'box' },
          { label: '千克', value: 'kg' },
        ],
      },
    ],
  },
  {
    type: 'group',
    label: '展示与选项',
    description: '多选、日期、自定义组件和插槽',
    anchor: true,
    children: [
      {
        prop: 'tags',
        label: '标签',
        type: 'checkbox',
        defaultValue: [],
        options: [
          { label: '热销', value: 'hot' },
          { label: '新品', value: 'new' },
          { label: '推荐', value: 'recommend' },
        ],
      },
      { prop: 'onlineDate', label: '上架日期', type: 'date' },
      { prop: 'publishAt', label: '发布时间', type: 'datetime' },
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
    label: '链接与联动',
    description: 'hidden / required 随类型变化',
    anchor: true,
    children: [
      {
        prop: 'type',
        label: '类型',
        type: 'radio',
        defaultValue: 'normal',
        options: [
          { label: '普通', value: 'normal' },
          { label: '外链', value: 'link' },
        ],
      },
      {
        prop: 'url',
        label: '链接地址',
        type: 'text',
        hidden: ({ values }) => values.type !== 'link',
        required: ({ values }) => values.type === 'link',
        disabled: ({ values }) => values.type !== 'link',
      },
      {
        prop: 'target',
        label: '打开方式',
        type: 'select',
        defaultValue: null,
        hidden: ({ values }) => values.type !== 'link',
        options: [
          { label: '当前窗口', value: '_self' },
          { label: '新窗口', value: '_blank' },
        ],
      },
    ],
  },
  {
    type: 'group',
    label: '媒体与附件',
    description: '图片、附件和通用上传，走注入的 uploadFile',
    anchor: true,
    children: [
      {
        prop: 'cover',
        label: '封面',
        type: 'picture',
        props: { maxCount: 1 },
      },
      {
        prop: 'gallery',
        label: '图集',
        type: 'picture',
        props: { maxCount: 3 },
      },
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
    ],
  },
  {
    type: 'group',
    label: '详情',
    description: '多行文本、富文本和多语言翻译',
    anchor: true,
    children: [
      {
        prop: 'summary',
        label: '摘要',
        type: 'textarea',
        span: 24,
        tip: '最多 200 字',
        props: { maxlength: 200, showWordLimit: true },
      },
      {
        prop: 'detail',
        label: '详情',
        type: 'rich-text',
        span: 24,
        translateConfig: {
          language: [
            { code: 'en', label: 'English' },
            { code: 'zh_cn', label: '简体中文' },
            { code: 'ja', label: '日本語' },
          ],
          translate: async ({ command, sourceValue, targetLanguages }) => {
            const text = String(sourceValue ?? '');
            const suffix = command === 'polish' ? '精翻' : '翻译';
            return Object.fromEntries(
              targetLanguages.map((code) => [
                code,
                text ? `${text}<p>（${suffix} → ${code}）</p>` : text,
              ]),
            );
          },
        },
      },
    ],
  },
];

export const drawerFormSample = {
  code: 'SKU-10086',
  name: '无线耳机',
  sort: 12,
  enabled: true,
  status: '1',
  sex: '1',
  job: 'dev',
  deptId: 2,
  saleType: 'piece',
  unit: 'pcs',
  tags: ['hot', 'new'],
  onlineDate: '2026-10-01',
  publishAt: '2026-10-01 09:30:00',
  themeColor: '#409EFF',
  score: 5,
  type: 'link',
  url: 'https://example.com/product',
  target: '_blank',
  cover: '/logo.svg',
  gallery: ['/logo.svg', '/logo.svg'],
  summary: '主动降噪，长续航。',
  detail: {
    en: '<p>Noise cancelling wireless earbuds.</p>',
    zh_cn: '<p>主动降噪无线耳机。</p>',
    ja: '<p>ノイズキャンセリングイヤホン。</p>',
  },
};
