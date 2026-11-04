# DisguiseIcon 图标

把图标字体类名拼成 `disguiseicon-{icon}`。组件本身不包含字体文件。

<script setup>
import Basic from './demos/disguise-icon-basic.vue'
import source from './demos/disguise-icon-basic.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

使用方需要自己引入对应的 iconfont 样式。需要改颜色、尺寸时直接传 `style` 或原生属性。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `icon` | `string` | `''` | 图标名 |
| `className` | `string` | `'disguiseicon'` | 类名前缀 |

未列出的属性和事件监听器会透传给 Element Plus `ElIcon`。

## Events

该组件暂无自定义事件；传入的监听器会由 `ElIcon` 接收。

## Slots

该组件暂无自定义插槽。图标内容由 `icon` 与 `className` 生成的字体类名决定。
