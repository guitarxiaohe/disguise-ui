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

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `schema` | `SearchFormItem[]` | `[]` | 字段，类型同 SchemaForm |
| `columns` | `number` | `4` | 每行列数 |
| `collapsedRows` | `number` | `2` | 折叠时保留的行数 |
| `labelPosition` | `'left' \| 'right' \| 'top'` | `'left'` | 标签位置 |
| `labelWidth` | `number \| string` | `'auto'` | 标签宽度 |
| `showActions` | `boolean` | `true` | 是否显示查询 / 重置 |

## Events

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `search` | `values` | 点击查询 |
| `reset` | `values` | 点击重置 |
