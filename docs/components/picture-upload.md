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
| `accept` | `string[]` | `['image/*']` | 允许的图片 MIME 类型或扩展名 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `width` | `number` | `96` | 预览宽度，单位 px |
| `height` | `number` | `96` | 预览高度，单位 px |
| `showPreview` | `boolean` | `true` | 预览 |
| `showDownload` | `boolean` | `true` | 是否显示下载按钮 |
| `showRemove` | `boolean` | `true` | 是否显示删除按钮 |
| `selected` | `boolean` | `false` | 是否显示选中边框 |
| `errorMessage` | `string` | `''` | 错误状态文字 |
| `baseFolder` | `string` | `''` | 上传目录 |
| `addWatermark` | `boolean` | — | 是否加水印 |

## Events

| 名称 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `value` | 图片值变化 |
| `uploadSuccess` | `file: AttachmentData` | 上传成功 |
| `uploadError` | `error: Error` | 上传失败 |
| `remove` | `file: AttachmentData` | 删除图片 |
| `preview` | `file: AttachmentData` | 预览图片 |
| `download` | `file: AttachmentData` | 下载图片 |

## Slots

该组件暂无插槽。
