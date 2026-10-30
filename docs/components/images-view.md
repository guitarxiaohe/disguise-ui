# ImagesView 图片预览

把多张图片叠成一摞缩略图。悬停看大图，点击后用 Element Plus 的图片查看器全屏预览，可以左右切换。

<script setup>
import Basic from './demos/images-view-basic.vue'
import source from './demos/images-view-basic.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

多于一张且 `size` 不小于 80 时，最上层右下角会显示总张数。表格 `picture` 单元格和表单里的图片只读态也是用这个组件渲染的。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `images` | `string[]` | `[]` | 图片地址。空数组时显示「暂无图片」 |
| `size` | `number` | `80` | 单张缩略图边长，单位像素 |
| `maxStack` | `number` | `3` | 最多叠放多少层，其余图片仍可在全屏预览里看到 |
| `offset` | `number` | `6` | 每一层相对上一层的偏移，单位像素 |
