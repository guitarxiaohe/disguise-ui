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

| 名称           | 类型                                    | 默认值    | 说明         |
| -------------- | --------------------------------------- | --------- | ------------ |
| `visible`      | `boolean`                               | —         | 弹窗显隐     |
| `modelValue`   | `any \| any[]`                          | —         | 当前选中值   |
| `multiple`     | `boolean`                               | `true`    | 是否多选     |
| `fetcher`      | `(params) => Promise<{ items, total }>` | —         | 分页取数函数 |
| `columns`      | `ColumnsItem[]`                         | `[]`      | 列配置       |
| `rowKey`       | `string`                                | `'id'`    | 行唯一字段   |
| `dialogTitle`  | `string`                                | `''`      | 弹窗标题     |
| `dialogWidth`  | `number \| string`                      | `'960px'` | 弹窗宽度     |
| `tableHeight`  | `number`                                | `420`     | 表格高度     |
| `perPage`      | `number`                                | `20`      | 每页条数     |
| `filterParams` | `Record<string, any>`                   | `{}`      | 额外筛选条件 |

## Events

| 名称                | 参数                          | 说明                                            |
| ------------------- | ----------------------------- | ----------------------------------------------- |
| `update:visible`    | `visible: boolean`            | 弹窗显隐变化；使用 `v-model:visible` 时自动绑定 |
| `update:modelValue` | `value: any \| any[]`         | 确认后的行主键值                                |
| `confirm`           | `rows: Record<string, any>[]` | 点击确认时返回当前可取得的选中行                |

## Slots

该组件暂无插槽。

## 暴露属性

| 名称       | 说明                        |
| ---------- | --------------------------- |
| `tableRef` | 内部 `TableEntity` 实例引用 |
