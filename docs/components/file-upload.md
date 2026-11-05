# FileUpload 文件上传

支持单文件、多文件、上传进度、预览、下载和删除。实际上传通过 `setupDisguise({ uploadFile })` 注入。

<script setup>
import Basic from './demos/file-upload-basic.vue'
import source from './demos/file-upload-basic.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

`maxCount > 1` 时进入多文件模式：文件并发上传、逐条显示进度，已上传数量加上传中数量达到上限后不再渲染上传入口。单个文件超过 20MB 自动分片上传。预览时视频文件（mp4、webm、mov 等）在内置弹窗中播放，其余类型在新窗口打开。

## Props

| 名称           | 类型                                           | 默认值                 | 说明                                                                                 |
| -------------- | ---------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------ |
| `modelValue`   | `string \| AttachmentData \| AttachmentData[]` | `''`                   | 文件值                                                                               |
| `disabled`     | `boolean`                                      | `false`                | 是否禁用                                                                             |
| `maxSize`      | `number`                                       | `2000`                 | 单文件大小上限，MB；超出时提示并拒绝上传                                             |
| `accept`       | `string[]`                                     | `[]`                   | 允许的文件类型，`[]` 表示不限制；支持 MIME 通配（如 `image/*`）和扩展名（如 `.pdf`） |
| `width`        | `number`                                       | `200`                  | 文件项宽度，px；预留属性，当前版本未参与样式计算                                     |
| `height`       | `number`                                       | `40`                   | 文件项高度，px；预留属性，当前版本未参与样式计算                                     |
| `showPreview`  | `boolean`                                      | `true`                 | 是否显示预览                                                                         |
| `showDownload` | `boolean`                                      | `true`                 | 是否显示下载                                                                         |
| `showRemove`   | `boolean`                                      | `true`                 | 是否显示删除                                                                         |
| `fileName`     | `string`                                       | —                      | 自定义显示文件名                                                                     |
| `placeholder`  | `string`                                       | 内置文案（`点击上传`） | 占位文案                                                                             |
| `selected`     | `boolean`                                      | `false`                | 是否显示选中状态                                                                     |
| `errorMessage` | `string`                                       | `''`                   | 错误状态文案                                                                         |
| `maxCount`     | `number`                                       | `1`                    | 最大文件数；大于 1 时启用多文件模式                                                  |

## Events

| 名称                | 参数    | 说明       |
| ------------------- | ------- | ---------- |
| `update:modelValue` | `value` | 文件值变化 |
| `uploadSuccess`     | `file`  | 上传成功   |
| `uploadError`       | `error` | 上传失败   |
| `remove`            | `file`  | 删除文件   |
| `preview`           | `file`  | 预览文件   |
| `download`          | `file`  | 下载文件   |

## Slots

该组件暂无插槽。
