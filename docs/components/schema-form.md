# SchemaForm 元数据表单

用一份纯数据的 schema 描述表单。组件负责渲染控件、生成校验规则、处理只读态与字段联动。

<script setup>
import Basic from './demos/schema-form-basic.vue'
import basicSource from './demos/schema-form-basic.vue?raw'
import Linkage from './demos/schema-form-linkage.vue'
import linkageSource from './demos/schema-form-linkage.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="basicSource">
    <Basic />
  </DemoBlock>
</ClientOnly>

## 字段联动

`hidden`、`disabled`、`required` 都可以传函数，参数里有当前模式和全量表单值。

<ClientOnly>
  <DemoBlock :source="linkageSource">
    <Linkage />
    <template #description>
      选择「外链」后才会出现链接地址和打开方式，并且链接变为必填。
    </template>
  </DemoBlock>
</ClientOnly>

## 控件类型

| type | 渲染 | 说明 |
| --- | --- | --- |
| `text` | `ElInput` | 带 clearable |
| `textarea` | `ElInput` | 多行 |
| `number` | `ElInputNumber` | 数字 |
| `cascader` | `ElCascader` | 默认开启 `filterable`，其他属性通过 `props` 透传 |
| `select` / `radio` / `checkbox` | 对应 Element 控件 | 需要 `options` 或 `dictCode` |
| `switch` | `ElSwitch` | 开关 |
| `date` / `datetime` | `ElDatePicker` | 日期 / 日期时间 |
| `picture` / `file` / `upload` | 上传组件 | 配置走 `props` |
| `async-select` | `AsyncSelect` | 需要 `apiOptions` |
| `rich-text` | `RichTextEditor` | 富文本 |
| `slot` / `component` | 自定义 | 插槽或注册组件 |
| `group` | 容器 | 一个 label 下并排多个控件 |

## 选项来源

```ts
{ type: 'radio', options: [{ label: '正常', value: '0' }] }
{ type: 'select', optionSource: 'dict', dictCode: 'sys_user_sex' }
{ type: 'async-select', apiOptions: { entityKey: 'dept' } }
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `Record<string, any>` | `{}` | 表单值，用 `v-model` 绑定 |
| `schema` | `SchemaFormItem[]` | `[]` | 字段元数据 |
| `mode` | `'create' \| 'edit' \| 'view'` | `'create'` | 影响显隐与只读 |
| `columns` | `number` | `1` | 栅格列数 |
| `underline` | `boolean` | `false` | 输入控件是否只显示下边框 |
| `labelAlign` | `'center' \| 'left' \| 'right'` | — | 标签文字对齐 |
| `itemGap` | `number \| string` | `30` | 表单项纵向间距 |
| `groupGap` | `number \| string` | `0` | 分组额外上下间距 |
| `labelGap` | `number \| string` | `20` | 标签与控件间距 |
| `labelWidth` | `number \| string` | `'auto'` | 标签宽度 |
| `labelPosition` | `'left' \| 'right' \| 'top'` | `'top'` | 标签位置 |
| `disabled` | `boolean` | `false` | 整体禁用 |
| `loading` | `boolean` | `false` | 加载遮罩 |

查看态只要传 `mode="view"`，schema 不用改。

## Events

| 名称 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `values: Record<string, any>` | 字段值变化；使用 `v-model` 时自动绑定 |

## Slots

字段使用动态插槽：插槽名等于字段 `prop`，参数如下。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `field` | `ResolvedField` | 解析后的字段配置 |
| `value` | `any` | 当前字段值 |
| `disabled` | `boolean` | 合并表单、分组与字段后的禁用状态 |
| `updateValue` | `(value: any) => void` | 更新当前字段值 |

## Schema 字段属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `FieldType` | — | 控件类型 |
| `prop` | `string` | — | 表单字段名，同时也是动态插槽名 |
| `label` | `string` | — | 字段标签 |
| `component` | `Component \| string \| config` | — | 覆盖内置控件或使用已注册组件 |
| `defaultValue` | `any` | — | 初始化和重置时使用的默认值 |
| `disabled` | `boolean \| (context) => boolean` | `false` | 是否禁用 |
| `hidden` | `boolean \| (context) => boolean` | `false` | 是否隐藏；隐藏字段不会出现在 `getValues()` 中 |
| `hideOnCreate` / `hideOnEdit` | `boolean` | `false` | 在对应模式隐藏 |
| `readonly` | `boolean` | `false` | 是否以纯文本呈现 |
| `copyable` | `boolean` | 跟随 `readonly` | 只读态是否显示复制按钮 |
| `required` | `boolean \| (context) => boolean` | `false` | 是否必填 |
| `rules` | `FormItemRule[]` | `[]` | Element Plus 校验规则 |
| `placeholder` | `string` | 自动生成 | 占位文字 |
| `props` | `Record \| (context) => Record` | `{}` | 透传给底层控件的属性 |
| `span` | `number` | 按列数均分 | 24 栅格占位 |
| `newRow` | `boolean` | `false` | 是否强制另起一行 |
| `tip` | `string` | — | 控件下方提示 |
| `translateConfig` | `TranslateConfig` | — | 多语言编辑配置 |
| `options` | `FieldOption[] \| (context) => FieldOption[]` | — | 静态或动态选项 |
| `dictCode` | `string` | — | 字典选项编码 |
| `optionSource` | `'static' \| 'dict' \| 'api'` | 按字段推断 | 选项来源 |
| `apiOptions` | `ApiFieldOptions` | — | 远程选择配置 |

`type: 'group'` 使用 `children` 存放子字段，还支持 `anchor`、`description`、`disabled`、`hidden`、`span`、`newRow` 和 `tip`。

## 暴露方法

| 名称 | 说明 |
| --- | --- |
| `validate()` | 校验并返回 `Promise<boolean>`，失败时滚动到首个错误字段 |
| `clearValidate()` | 清除校验状态 |
| `resetFields()` | 重置字段 |
| `getValues()` | 获取当前可见字段值，自动排除隐藏字段 |

## 富文本自定义工具

`rich-text` 字段的 `props.richTextTools` 具有完整类型推导。除编辑器上下文外，工具还会收到当前字段、表单模式和整张表单的数据；该能力同样适用于 `CrudPage` 的表单字段。

~~~ts
import type { SchemaFormItem } from 'disguise-ui'
import { PackagePlus } from 'lucide-vue-next'

const schema: SchemaFormItem[] = [
  {
    prop: 'content',
    type: 'rich-text',
    label: '商品详情',
    span: 24,
    props: {
      maxHeight: '320px',
      richTextTools: [
        {
          key: 'insert-product',
          label: '插入商品',
          icon: PackagePlus,
          visible: ({ mode }) => mode !== 'view',
          onClick: ({ editor, getFormData }) => {
            const product = getFormData().product
            editor
              .chain()
              .focus()
              .insertContent('<p>' + (product?.name ?? '未选择商品') + '</p>')
              .run()
          },
        },
      ],
    },
  },
]
~~~

Schema 场景额外提供以下上下文：

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `field` | `ResolvedField` | 当前字段元数据 |
| `formData` | `Record<string, any>` | 本次渲染时的整张表单值 |
| `getFormData` | `() => Record<string, any>` | 获取最新的整张表单值 |
| `mode` | `'create'\| 'edit'\| 'view'` | 当前表单模式 |
| `language` | `string\| undefined` | 多语言富文本当前语言代码 |

若工具需要打开弹窗或执行异步任务，请在真正提交时调用 `getFormData()`，避免使用已经过期的 `formData` 快照。
