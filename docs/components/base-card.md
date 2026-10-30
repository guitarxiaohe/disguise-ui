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
