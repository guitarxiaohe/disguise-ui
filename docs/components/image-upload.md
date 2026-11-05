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

上传成功后自动写入图片 URL，点删除按钮清空；类型或大小校验不通过时用 ElMessage 提示。悬停已上传图片可预览、删除。

## Props

| 名称         | 类型       | 默认值                                                       | 说明                                           |
| ------------ | ---------- | ------------------------------------------------------------ | ---------------------------------------------- |
| `modelValue` | `string`   | `''`                                                         | 图片 URL                                       |
| `width`      | `number`   | `96`                                                         | 预览宽度，单位 px                              |
| `height`     | `number`   | `96`                                                         | 预览高度，单位 px                              |
| `maxSize`    | `number`   | `5`                                                          | 大小限制，单位 MB；超出时提示并拒绝上传        |
| `accept`     | `string[]` | `['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']` | 允许的 MIME 类型（精确匹配，空数组不校验类型） |
| `disabled`   | `boolean`  | `false`                                                      | 是否禁用上传和删除                             |

## Events

| 名称                | 参数          | 说明                                                |
| ------------------- | ------------- | --------------------------------------------------- |
| `update:modelValue` | `url: string` | 上传或删除后更新图片 URL；使用 `v-model` 时自动绑定 |

## Slots

该组件暂无插槽。
