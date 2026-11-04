# ImportDialog 导入

Excel / CSV 导入弹窗，包含上传、预览、字段映射和结果反馈。`CrudPage` 传入 `importUrl` 后会自动使用它。

<script setup>
import Basic from './demos/import-dialog-basic.vue'
import source from './demos/import-dialog-basic.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

可以传入 `api` / `templateUrl` 让组件内部发请求，也可以自己实现 `parseFile` 和 `submitImport`。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | 弹窗显隐 |
| `api` | `string` | — | 导入上传接口；传入后组件内部提交文件 |
| `templateUrl` | `string` | — | 模板下载接口 |
| `templateMethod` | `'GET' \| 'POST'` | `'POST'` | 模板下载请求方法 |
| `templateName` | `string` | `'导入模版'` | 下载文件名 |
| `title` | `string` | 内置文案 | 弹窗标题 |
| `defaultMode` | `ImportDialogMode` | `'create'` | 默认导入模式 |
| `modes` | `ImportDialogModeOption[]` | 新增、更新 | 可选导入模式 |
| `accept` | `string[]` | `['.xls', '.xlsx']` | 允许的文件扩展名 |
| `maxSize` | `number` | `5` | 文件大小上限，单位 MB |
| `maxPreviewCount` | `number` | `100` | 最大预览行数 |
| `tips` | `string[]` | 内置文案 | 上传页提示 |
| `targetFields` | `ImportDialogTargetField[]` | `[]` | 字段映射目标 |
| `parseFile` | `(payload) => Promise<ImportDialogParseResult>` | — | 自定义文件解析 |
| `submitImport` | `(payload) => Promise<ImportDialogSubmitResult>` | — | 自定义导入提交 |
| `resetOnClose` | `boolean` | `true` | 关闭弹窗后是否重置流程 |

## Events

| 名称 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `visible: boolean` | 弹窗显隐变化 |
| `downloadTemplate` | — | 点击下载模板 |
| `fileChange` | `file: File \| null` | 当前文件变化 |
| `success` | `result` | 导入成功 |
| `error` | `Error \| result` | 解析或导入失败 |
| `cancel` | — | 用户取消 |

## Slots

该组件暂无插槽。
