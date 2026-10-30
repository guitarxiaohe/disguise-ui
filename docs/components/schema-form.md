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
| `labelWidth` | `number \| string` | `'auto'` | 标签宽度 |
| `labelPosition` | `'left' \| 'right' \| 'top'` | `'top'` | 标签位置 |
| `disabled` | `boolean` | `false` | 整体禁用 |
| `loading` | `boolean` | `false` | 加载遮罩 |

查看态只要传 `mode="view"`，schema 不用改。
