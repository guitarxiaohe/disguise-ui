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

| 名称       | 类型                       | 默认值 | 说明                                                          |
| ---------- | -------------------------- | ------ | ------------------------------------------------------------- |
| `code`     | `string`                   | `''`   | 字典编码                                                      |
| `dictType` | `string`                   | `''`   | `code` 的兼容别名                                             |
| `value`    | `string \| number \| null` | `null` | 字典值                                                        |
| `label`    | `string \| number \| null` | `null` | 直接指定显示文字，优先于字典结果                              |
| `color`    | `string \| null`           | `null` | `primary/success/warning/danger/info` 等语义色或任意 CSS 颜色 |

## Events

该组件暂无自定义事件。

## Slots

该组件暂无插槽。
