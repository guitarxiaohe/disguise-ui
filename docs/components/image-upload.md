# ImageUpload 头像上传

更轻量的单图上传，适合头像、封面等只需要 URL 字符串的场景。

<script setup>
import Basic from './demos/image-upload-basic.vue'
import source from './demos/image-upload-basic.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | 图片 URL |
| `width` | `number` | `96` | 预览宽度，单位 px |
| `height` | `number` | `96` | 预览高度，单位 px |
| `maxSize` | `number` | `5` | 大小限制，单位 MB |
| `accept` | `string[]` | PNG / JPEG / SVG / WebP | 允许的 MIME |
| `disabled` | `boolean` | `false` | 是否禁用上传和删除 |

## Events

| 名称 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `url: string` | 上传或删除后更新图片 URL；使用 `v-model` 时自动绑定 |

## Slots

该组件暂无插槽。
