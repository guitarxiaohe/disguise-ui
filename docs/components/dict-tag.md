# DictTag 字典标签

按字典编码把原始值渲染成彩色标签。字典数据来自 `setupDisguise({ fetchAllDictData })`。

<script setup>
import Basic from './demos/dict-tag-basic.vue'
import source from './demos/dict-tag-basic.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

未匹配到字典项时显示原始值。也可以直接传 `label` 和 `color`。

## Props

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `code` | `string` | 字典编码 |
| `dictType` | `string` | 同 `code`，兼容旧调用 |
| `value` | `string \| number` | 字典值 |
| `label` | `string` | 直接显示的文字 |
| `color` | `string` | 语义色或自定义颜色 |
