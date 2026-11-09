# ImportDialog 导入

Excel / CSV 导入弹窗，包含上传、预览、字段映射和结果反馈。`CrudPage` 传入 `importUrl` 后会自动使用它。

<script setup>
import Basic from './demos/import-dialog-basic.vue'
import source from './demos/import-dialog-basic.vue?raw'
import Template from './demos/import-dialog-template.vue'
import templateSource from './demos/import-dialog-template.vue?raw'
import Duplicate from './demos/import-dialog-duplicate.vue'
import duplicateSource from './demos/import-dialog-duplicate.vue?raw'

</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

可以传入 `api` / `templateUrl` 让组件内部发请求，也可以自己实现 `parseFile` 和 `submitImport`。

未传 `api` 时组件按「上传文件 → 确认数据 → 字段映射 → 导入」四步推进：选择文件后调用 `parseFile` 解析出 sheet、预览列和预览行；确认数据页可切换 sheet 重新解析；字段映射页把 Excel 列对应到 `targetFields`；最后调用 `submitImport` 提交，进度通过入参 `onProgress` 回传。传入 `api` 后进入直传模式，组件隐藏步骤条，选择文件后直接上传给接口，由后端完成解析与导入。

## 模板下载

传入 `templateUrl` 时组件按 `templateMethod` 请求接口，优先用响应头 `content-disposition`、否则用 `templateName` 作为保存文件名。不传 `templateUrl` 时，点击「下载模板」会抛出 `downloadTemplate` 事件，由调用方自行处理。

<ClientOnly>
  <DemoBlock :source="templateSource">
    <Template />
  </DemoBlock>
</ClientOnly>

## 重复处理策略

映射页的「查重」列控制该字段导入时是否按来源列查重：`targetFields[].allowDuplicateCheck` 为 `false` 时勾选框被锁定（不查重），否则由用户勾选；`parseFile` 返回的 `mappings[].duplicateCheck` 作为勾选初值。提交时每个字段的 `duplicateCheck` 随 `submitImport` 入参的 `mappings` 一起交给业务侧，查重逻辑由后端执行。

<ClientOnly>
  <DemoBlock :source="duplicateSource">
    <Duplicate />
  </DemoBlock>
</ClientOnly>

## Props

| 名称              | 类型                                             | 默认值              | 说明                                                                                 |
| ----------------- | ------------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------ |
| `modelValue`      | `boolean`                                        | `false`             | 弹窗显隐                                                                             |
| `api`             | `string`                                         | —                   | 导入上传接口；传入后组件内部提交文件                                                 |
| `templateUrl`     | `string`                                         | —                   | 模板下载接口                                                                         |
| `templateMethod`  | `'GET' \| 'POST'`                                | `'POST'`            | 模板下载请求方法                                                                     |
| `templateName`    | `string`                                         | `'导入模版'`        | 下载文件名                                                                           |
| `title`           | `string`                                         | 内置文案            | 弹窗标题                                                                             |
| `defaultMode`     | `ImportDialogMode`                               | `'create'`          | 默认导入模式，随解析、导入请求提交                                                   |
| `modes`           | `ImportDialogModeOption[]`                       | 新增、更新          | 导入模式选项；当前版本无选择入口                                                     |
| `accept`          | `string[]`                                       | `['.xls', '.xlsx']` | 允许的文件扩展名                                                                     |
| `maxSize`         | `number`                                         | `5`                 | 文件大小上限，单位 MB                                                                |
| `maxPreviewCount` | `number`                                         | `100`               | 预览汇总文案中的最大统计行数，表格实际行数由 `parseFile` 返回的 `previewRows` 决定   |
| `tips`            | `string[]`                                       | 内置文案            | 上传页提示                                                                           |
| `importDesc`      | `string`                                         | —                   | 导入说明文字，显示在上传区「导入说明」标题下；未传时不显示该区域                     |
| `skipSteps`       | `Array<'preview' \| 'mapping'>`                  | `[]`                | 跳过的流程步骤：`preview` 确认数据、`mapping` 字段映射；跳过后上传文件确认即直接导入 |
| `targetFields`    | `ImportDialogTargetField[]`                      | `[]`                | 字段映射目标                                                                         |
| `parseFile`       | `(payload) => Promise<ImportDialogParseResult>`  | —                   | 自定义文件解析                                                                       |
| `submitImport`    | `(payload) => Promise<ImportDialogSubmitResult>` | —                   | 自定义导入提交                                                                       |
| `resetOnClose`    | `boolean`                                        | `true`              | 关闭弹窗后是否重置流程                                                               |

### 简化流程

通过 `skipSteps` 可以去掉「确认数据」「字段映射」步骤，步骤条同步只展示剩余步骤，上传文件后点击「开始导入」即可直接导入（解析仍在后台自动完成，`submitImport` 照常拿到 `sheet` 与解析出的 `mappings`）：

```vue
<ImportDialog
  v-model="visible"
  :skip-steps="['preview', 'mapping']"
  :parse-file="parseFile"
  :submit-import="submitImport"
/>
```

只跳过 `mapping` 时仍会展示「确认数据」页面，但按钮直接变为「开始导入」，且不再做映射校验。

## Events

| 名称                | 参数                 | 说明           |
| ------------------- | -------------------- | -------------- |
| `update:modelValue` | `visible: boolean`   | 弹窗显隐变化   |
| `downloadTemplate`  | —                    | 点击下载模板   |
| `fileChange`        | `file: File \| null` | 当前文件变化   |
| `success`           | `result`             | 导入成功       |
| `error`             | `Error \| result`    | 解析或导入失败 |
| `cancel`            | —                    | 用户取消       |

## Slots

该组件暂无插槽。
