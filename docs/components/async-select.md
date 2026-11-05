# AsyncSelect 远程选择

带分页搜索的下拉框，右侧按钮可打开弹窗列表。选项可以来自 `fetcher`、静态 `options` 或 `dictCode`。

<script setup>
import Basic from './demos/async-select-basic.vue'
import source from './demos/async-select-basic.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

远程数据优先通过 `registerEntity` 注册，表单字段里写 `apiOptions.entityKey` 即可。独立使用时把实体上的 `fetch` 传给 `fetcher`。

## Props

| 名称          | 类型                                    | 默认值   | 说明                         |
| ------------- | --------------------------------------- | -------- | ---------------------------- |
| `modelValue`  | `string \| number \| array`             | —        | 选中值                       |
| `fetcher`     | `(params) => Promise<{ items, total }>` | —        | 服务端分页取数               |
| `options`     | `object[]`                              | `[]`     | 本地选项                     |
| `dictCode`    | `string`                                | —        | 读取缓存字典                 |
| `valueKey`    | `string`                                | `'id'`   | 值字段                       |
| `labelKey`    | `string`                                | —        | 标签字段                     |
| `multiple`    | `boolean`                               | `false`  | 多选                         |
| `columns`     | `ColumnsItem[]`                         | `[]`     | 弹窗列表列                   |
| `subtitleKey` | `string`                                | `''`     | 下拉选项副标题字段           |
| `placeholder` | `string`                                | 内置文案 | 占位文字                     |
| `disabled`    | `boolean`                               | `false`  | 是否禁用                     |
| `dialogTitle` | `string`                                | 内置文案 | 选择弹窗标题                 |
| `perPage`     | `number`                                | `20`     | 下拉请求及弹窗列表的每页条数 |

未列出的属性会继续透传给 Element Plus `ElSelectV2`。

## Events

| 名称                | 参数               | 说明                                  |
| ------------------- | ------------------ | ------------------------------------- |
| `update:modelValue` | `value: SelectVal` | 选中值变化；使用 `v-model` 时自动绑定 |
| `change`            | `value, rows`      | 从弹窗确认选择后触发，同时返回选中行  |

## Slots

该组件暂无对外插槽；选中标签与下拉选项使用组件内置布局。

## 暴露方法

| 名称       | 说明                     |
| ---------- | ------------------------ |
| `reload()` | 强制重新请求远程第一页   |
| `allItems` | 当前已加载的原始选项引用 |

## 服务端分页

`fetcher` 的每次调用都会携带 `page`、`per_page` 和可选的 `keyword`。接口必须只返回当前页的 `items`，并通过 `total` 返回符合条件的数据总数；下拉懒加载和弹窗分页都使用同一套参数，不应先获取全量数据再由前端切片。

```ts
const fetcher: AsyncSelectDataFetcher = async ({
  page,
  per_page,
  keyword,
  selectedValues,
}) => {
  const result = await getProductList({
    page,
    pageSize: per_page,
    keyword,
    ids: selectedValues,
  });
  return {
    items: result.list,
    total: result.total,
  };
};
```

组件为回显尚未加载的选中项时会传入 `selectedValues`。接口应按值字段过滤这些记录；不要为回显返回全量列表。
