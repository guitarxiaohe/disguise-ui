# DialogList 弹窗列表

带搜索、分页和单选/多选能力的弹窗列表。

<script setup>
import Basic from './demos/dialog-list-basic.vue'
import source from './demos/dialog-list-basic.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

`fetcher` 接收 `keyword`、`page`、`per_page` 和 `filterParams`，返回当前页数据与总条数。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `visible` | `boolean` | — | 弹窗显隐 |
| `modelValue` | `any \| any[]` | — | 当前选中值 |
| `multiple` | `boolean` | `true` | 是否多选 |
| `fetcher` | `(params) => Promise<{ items, total }>` | — | 分页取数函数 |
| `columns` | `ColumnsItem[]` | `[]` | 列配置 |
| `rowKey` | `string` | `'id'` | 行唯一字段 |
| `dialogTitle` | `string` | `''` | 弹窗标题 |
| `dialogWidth` | `number \| string` | `'960px'` | 弹窗宽度 |
| `tableHeight` | `number` | `420` | 表格高度 |
| `perPage` | `number` | `20` | 每页条数 |
| `filterParams` | `Record<string, any>` | `{}` | 额外筛选条件 |
