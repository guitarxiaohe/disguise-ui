# SearchForm 搜索表单

基于 `SchemaForm` 的查询表单，带折叠、重置和查询按钮。`CrudPage` 内部默认使用它。

<script setup>
import Basic from './demos/search-form-basic.vue'
import source from './demos/search-form-basic.vue?raw'
import Collapse from './demos/search-form-collapse.vue'
import collapseSource from './demos/search-form-collapse.vue?raw'
import Quick from './demos/search-form-quick.vue'
import quickSource from './demos/search-form-quick.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

## 折叠与展开

可见字段数超过 `columns × collapsedRows` 时自动收起，只保留前 `collapsedRows` 行；点击「展开」显示全部条件，再点「收起」恢复。`showActions: false` 时不折叠。

<ClientOnly>
  <DemoBlock :source="collapseSource">
    <Collapse />
    <template #description>
      6 个字段、每行 3 个、只保留 1 行，超出的部分收进「展开」。
    </template>
  </DemoBlock>
</ClientOnly>

## 快捷触发搜索

文本和数字输入框按回车会立即查询；选择普通下拉（`select`）、异步下拉（`async-select`）或级联（`cascader`）选项后也会自动查询，无需再次点击搜索按钮。

<ClientOnly>
  <DemoBlock :source="quickSource">
    <Quick />
    <template #description>
      在「关键词」输入后按回车，或切换「状态」「岗位」下拉，都会立即触发一次查询。
    </template>
  </DemoBlock>
</ClientOnly>

## Props

| 名称            | 类型                            | 默认值     | 说明                       |
| --------------- | ------------------------------- | ---------- | -------------------------- |
| `modelValue`    | `Record<string, any>`           | `{}`       | 当前查询值，支持 `v-model` |
| `schema`        | `SearchFormItem[]`              | `[]`       | 字段，类型同 SchemaForm    |
| `columns`       | `number`                        | `4`        | 每行列数                   |
| `collapsedRows` | `number`                        | `2`        | 折叠时保留的行数           |
| `disabled`      | `boolean`                       | `false`    | 是否禁用全部查询控件       |
| `labelAlign`    | `'center' \| 'left' \| 'right'` | `'left'`   | 标签文字对齐               |
| `labelPosition` | `'left' \| 'right' \| 'top'`    | `'left'`   | 标签位置                   |
| `labelWidth`    | `number \| string`              | `'auto'`   | 标签宽度                   |
| `mode`          | `'create' \| 'edit' \| 'view'`  | `'create'` | 传给字段条件函数的模式     |
| `showActions`   | `boolean`                       | `true`     | 是否显示查询 / 重置        |

## Events

| 名称                | 参数     | 说明                                  |
| ------------------- | -------- | ------------------------------------- |
| `update:modelValue` | `values` | 查询值变化；使用 `v-model` 时自动绑定 |
| `search`            | `values` | 点击查询、输入框回车或下拉选项变化    |
| `reset`             | `values` | 点击重置                              |

## Slots

| 名称          | 插槽参数                                  | 说明                                                           |
| ------------- | ----------------------------------------- | -------------------------------------------------------------- |
| `{fieldProp}` | `{ field, value, disabled, updateValue }` | 自定义字段控件，插槽名等于字段 `prop`，原样透传给 `SchemaForm` |

## 暴露方法

| 名称          | 说明                                  |
| ------------- | ------------------------------------- |
| `getValues()` | 获取当前查询值的副本                  |
| `validate()`  | 校验当前表单并返回 `Promise<boolean>` |
| `search()`    | 触发查询事件                          |
| `reset()`     | 恢复字段默认值并触发重置事件          |
