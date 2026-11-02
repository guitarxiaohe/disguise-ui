# FileUpload 文件上传

支持单文件、多文件、上传进度、预览、下载和删除。实际上传通过 `setupDisguise({ uploadFile })` 注入。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string \| AttachmentData \| AttachmentData[]` | `''` | 文件值 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `maxSize` | `number` | `2000` | 单文件大小上限，MB |
| `accept` | `string[]` | `[]` | 允许的文件类型 |
| `width` | `number` | `200` | 文件项宽度，px |
| `height` | `number` | `40` | 文件项高度，px |
| `showPreview` | `boolean` | `true` | 是否显示预览 |
| `showDownload` | `boolean` | `true` | 是否显示下载 |
| `showRemove` | `boolean` | `true` | 是否显示删除 |
| `fileName` | `string` | — | 自定义显示文件名 |
| `placeholder` | `string` | 内置文案 | 占位文案 |
| `selected` | `boolean` | `false` | 是否显示选中状态 |
| `errorMessage` | `string` | `''` | 错误状态文案 |
| `maxCount` | `number` | `1` | 最大文件数；大于 1 时启用多文件模式 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `value` | 文件值变化 |
| `uploadSuccess` | `file` | 上传成功 |
| `uploadError` | `error` | 上传失败 |
| `remove` | `file` | 删除文件 |
| `preview` | `file` | 预览文件 |
| `download` | `file` | 下载文件 |
