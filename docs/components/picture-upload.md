# PictureUpload 图片上传

单图或多图上传。实际上传走 `setupDisguise({ uploadFile })`，文档站里会生成本地预览地址。

<script setup>
import Basic from './demos/picture-upload-basic.vue'
import source from './demos/picture-upload-basic.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

`maxCount > 1` 或 `v-model` 为数组时进入多图模式。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string \| string[] \| AttachmentData \| AttachmentData[]` | `''` | 图片值 |
| `maxCount` | `number` | `1` | 最大数量 |
| `maxSize` | `number` | `5` | 大小限制，单位 MB |
| `width` / `height` | `number` | `96` | 预览尺寸 |
| `showPreview` | `boolean` | `true` | 预览 |
| `baseFolder` | `string` | `''` | 上传目录 |
| `addWatermark` | `boolean` | — | 是否加水印 |
