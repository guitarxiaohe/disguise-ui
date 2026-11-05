# SearchForm 搜索表单

基于 `SchemaForm` 的查询表单，带折叠、重置和查询按钮。`CrudPage` 内部默认使用它。

<script setup>
import Basic from './demos/search-form-basic.vue'
import source from './demos/search-form-basic.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

超过 `collapsedRows` 的行会被收起，点击展开后显示全部条件。

文本和数字输入框按回车会立即查询；选择普通下拉、异步下拉或级联选项后也会自动查询，无需再次点击搜索按钮。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `Record<string, any>` | `{}` | 当前查询值，支持 `v-model` |
| `schema` | `SearchFormItem[]` | `[]` | 字段，类型同 SchemaForm |
| `columns` | `number` | `4` | 每行列数 |
| `collapsedRows` | `number` | `2` | 折叠时保留的行数 |
| `disabled` | `boolean` | `false` | 是否禁用全部查询控件 |
| `labelAlign` | `'center' \| 'left' \| 'right'` | `'left'` | 标签文字对齐 |
| `labelPosition` | `'left' \| 'right' \| 'top'` | `'left'` | 标签位置 |
| `labelWidth` | `number \| string` | `'auto'` | 标签宽度 |
| `mode` | `'create' \| 'edit' \| 'view'` | `'create'` | 传给字段条件函数的模式 |
| `showActions` | `boolean` | `true` | 是否显示查询 / 重置 |

## Events

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `values` | 查询值变化；使用 `v-model` 时自动绑定 |
| `search` | `values` | 点击查询、输入框回车或下拉选项变化 |
| `reset` | `values` | 点击重置 |

## Slots

字段使用动态插槽：插槽名等于字段的 `prop`，参数为 `{ field, value, disabled, updateValue }`。这些插槽会原样传给内部 `SchemaForm`。

## 暴露方法

| 名称 | 说明 |
| --- | --- |
| `getValues()` | 获取当前查询值的副本 |
| `validate()` | 校验当前表单并返回 `Promise<boolean>` |
| `search()` | 触发查询事件 |
| `reset()` | 恢复字段默认值并触发重置事件 |
