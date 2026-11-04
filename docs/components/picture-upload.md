# PictureUpload 图片上传

单图或多图上传，支持上传前裁剪、最终像素尺寸限制、格式与文件大小校验以及自定义展示插槽。实际上传走 `setupDisguise({ uploadFile })`，文档站里会生成本地预览地址。

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

## 裁剪与尺寸限制

开启 `crop.enabled` 后，用户选择图片时会先进入裁剪窗口，可以拖动裁剪区域并通过四角调整大小。确认裁剪后，组件按以下顺序处理：

1. 生成裁剪后的图片文件。
2. 使用 `dimensions` 校验最终像素尺寸。
3. 使用 `maxSize` 校验最终文件大小。
4. 所有校验通过后上传。

未开启裁剪时，`dimensions` 和 `maxSize` 直接校验原图。`accept` 始终用于限制可选图片格式。

~~~vue
<PictureUpload
  v-model="cover"
  :accept="['image/jpeg', 'image/png', 'image/webp']"
  :max-size="5"
  :crop="{
    enabled: true,
    aspectRatio: 16 / 9,
    aspectRatios: [
      { label: '自由', value: null },
      { label: '1:1', value: 1 },
      { label: '4:3', value: 4 / 3 },
      { label: '16:9', value: 16 / 9 },
    ],
    quality: 0.9,
  }"
  :dimensions="{
    width: 1600,
    height: 900,
  }"
/>
~~~

当 `dimensions.width` 和 `dimensions.height` 同时设置时，裁剪框会自动采用对应宽高比，用户仍可选择保留区域，确认后输出为指定尺寸。

如果只要求尺寸范围：

~~~vue
<PictureUpload
  v-model="detailImage"
  :crop="{ enabled: true }"
  :dimensions="{
    minWidth: 800,
    minHeight: 600,
    maxWidth: 2400,
    maxHeight: 1800,
  }"
/>
~~~

裁剪窗口会实时显示当前结果尺寸，尺寸不符合限制时会显示原因并禁止确认。

## 自定义展示

可分别定制空状态、上传状态和已上传图片。`picture` 插槽提供预览、下载和删除方法；使用该插槽后，组件不会再叠加内置操作按钮。

~~~vue
<PictureUpload v-model="cover">
  <template #placeholder>
    <div class="custom-upload-trigger">上传封面</div>
  </template>

  <template #loading="{ progress }">
    <div>上传中 {{ progress }}%</div>
  </template>

  <template #picture="{ url, file, preview, remove }">
    <div class="custom-picture-card">
      <img :src="url" :alt="file.name" @click="preview" />
      <button type="button" @click="remove">删除</button>
    </div>
  </template>
</PictureUpload>
~~~

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
| `crop` | `PictureCropOptions` | — | 上传前裁剪配置；`enabled: true` 时打开裁剪窗口 |
| `dimensions` | `PictureDimensionOptions` | — | 裁剪后或原图的最终像素尺寸限制 |

### PictureCropOptions

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `false` | 是否需要裁剪 |
| `aspectRatio` | `number` | — | 固定裁剪框宽高比，例如 `1`、`4 / 3`、`16 / 9`；不传时自由裁剪 |
| `aspectRatios` | `PictureCropAspectRatioOption[]` | `[]` | 允许用户在裁剪窗口切换的比例；`value: null` 表示自由比例 |
| `mimeType` | `'image/jpeg' \| 'image/png' \| 'image/webp'` | 沿用原图支持的格式 | 裁剪结果格式 |
| `quality` | `number` | `0.9` | JPEG/WebP 输出质量，范围 `0～1` |

比例选项格式：

~~~ts
type PictureCropAspectRatioOption = {
  label: string
  value: number | null
}
~~~

`aspectRatio` 是默认选中的比例，`aspectRatios` 是用户可以切换的比例列表，两者可以同时使用。若配置了固定的 `dimensions.width` 和 `dimensions.height`，最终尺寸已经决定唯一宽高比，因此比例选择会被锁定；需要允许用户切换多个比例时，应使用最小/最大尺寸范围，而不是固定宽高。

### PictureDimensionOptions

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `width` | `number` | 最终图片固定宽度，px |
| `height` | `number` | 最终图片固定高度，px |
| `minWidth` | `number` | 最终图片最小宽度，px |
| `minHeight` | `number` | 最终图片最小高度，px |
| `maxWidth` | `number` | 最终图片最大宽度，px |
| `maxHeight` | `number` | 最终图片最大高度，px |

固定尺寸与范围限制可以组合使用；同一维度设置了固定值时，以固定值为准。

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

| 名称 | 参数 | 说明 |
| --- | --- | --- |
| `placeholder` | `{ multiple: boolean }` | 自定义空状态或上传触发器 |
| `default` | `{ multiple: boolean }` | `placeholder` 的兼容别名 |
| `loading` | `{ progress: number }` | 自定义上传中内容；多图模式为总进度 |
| `picture` | `{ file, url, index, preview, download, remove }` | 自定义已上传图片；多图模式下每张图片调用一次 |

## SchemaForm 元数据

`type: 'picture'` 时，将配置放在字段的 `props` 中：

~~~ts
{
  prop: 'cover',
  label: '封面图片',
  type: 'picture',
  required: true,
  props: {
    accept: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5,
    crop: {
      enabled: true,
      aspectRatio: 16 / 9,
      aspectRatios: [
        { label: '自由', value: null },
        { label: '1:1', value: 1 },
        { label: '4:3', value: 4 / 3 },
        { label: '16:9', value: 16 / 9 },
      ],
      quality: 0.9,
    },
    dimensions: {
      width: 1600,
      height: 900,
    },
  },
}
~~~
