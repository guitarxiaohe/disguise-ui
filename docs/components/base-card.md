# BaseCard 卡片

对 Element Plus `ElCard` 的薄封装，统一内边距和阴影。

<script setup>
import Basic from './demos/base-card-basic.vue'
import source from './demos/base-card-basic.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

阴影由 `setupDisguise({ cardShadow: 'hover' | 'always' | 'never' })` 控制。其余属性和插槽透传给 `ElCard`。

## Props

`BaseCard` 没有自定义属性。除 `shadow` 由全局 `cardShadow` 配置控制外，Element Plus `ElCard` 的属性都会透传。

## Events

没有自定义事件，原生属性与监听器会透传给 `ElCard`。

## Slots

| 名称      | 插槽参数 | 说明         |
| --------- | -------- | ------------ |
| `default` | —        | 卡片正文     |
| `header`  | —        | 卡片标题区域 |
| `footer`  | —        | 卡片底部区域 |

除此之外，当前 Element Plus `ElCard` 支持的具名插槽也会按原名称、原参数透传。
