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

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string \| number \| array` | — | 选中值 |
| `fetcher` | `(params) => Promise<{ items, total }>` | — | 远程取数 |
| `options` | `object[]` | `[]` | 本地选项 |
| `dictCode` | `string` | — | 读取缓存字典 |
| `valueKey` | `string` | `'id'` | 值字段 |
| `labelKey` | `string` | — | 标签字段 |
| `multiple` | `boolean` | `false` | 多选 |
| `columns` | `ColumnsItem[]` | `[]` | 弹窗列表列 |
