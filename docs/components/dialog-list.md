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

`fetcher` 接收 `{ page, per_page, params }`，其中 `params` 为 `filterParams` 与搜索值的合并结果（同名时搜索值覆盖 `filterParams`）；返回当前页数据与总条数。

## 搜索元数据

在 `columns` 上声明 `search` 即可自动生成搜索表单（`SearchForm`），无需再传关键词输入框。

| 配置             | 说明                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| `search: 对象`   | 生成搜索项，对象内容就是 `SearchForm` 字段配置（`type`、`placeholder`、`options`、`dictCode` 等） |
| `prop` / `label` | 缺省取列的 `dataIndex`（或 `dataKey`）/ `title`，可在 `search` 中覆盖                             |
| 其它键           | 未列入搜索字段配置键的其它键会合并进控件 `props`（显式 `search.props` 优先级低于这些透传键）      |
| `type`           | 缺省 `text`                                                                                       |

搜索 / 重置提交后，搜索值会并入 `fetcher` 的 `params` 触发重新请求；**不会重置页码**，仅靠查询条件变化触发请求。值为 `undefined`（如重置后的默认值）时不参与合并，不会覆盖 `filterParams` 的同名键。

## Props

| 名称           | 类型                                    | 默认值    | 说明                                            |
| -------------- | --------------------------------------- | --------- | ----------------------------------------------- |
| `visible`      | `boolean`                               | —         | 弹窗显隐                                        |
| `modelValue`   | `any \| any[]`                          | —         | 当前选中值                                      |
| `multiple`     | `boolean`                               | `true`    | 是否多选                                        |
| `fetcher`      | `(params) => Promise<{ items, total }>` | —         | 分页取数函数，接收 `{ page, per_page, params }` |
| `columns`      | `DialogListColumn[]`                    | `[]`      | 列配置，可附带 `search` 搜索元数据              |
| `rowKey`       | `string`                                | `'id'`    | 行唯一字段                                      |
| `dialogTitle`  | `string`                                | `''`      | 弹窗标题                                        |
| `dialogWidth`  | `number \| string`                      | `'960px'` | 弹窗宽度                                        |
| `tableHeight`  | `number`                                | `420`     | 表格高度                                        |
| `perPage`      | `number`                                | `20`      | 每页条数                                        |
| `filterParams` | `Record<string, any>`                   | `{}`      | 额外筛选条件，与搜索值合并进 `params`           |

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
