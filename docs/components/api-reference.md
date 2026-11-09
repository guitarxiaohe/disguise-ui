# 组件 API 总览

本页集中列出组件库顶层组件的全部公开属性。组件类型以源码中的 TypeScript 定义为准；`—` 表示没有默认值或该属性为必填项。

## AsyncSelect

| 属性          | 类型                                                  | 默认值                   | 说明                            |
| ------------- | ----------------------------------------------------- | ------------------------ | ------------------------------- |
| `modelValue`  | `string \| number \| null \| Array<string \| number>` | —                        | 当前选中值                      |
| `multiple`    | `boolean`                                             | `false`                  | 是否多选                        |
| `fetcher`     | `AsyncSelectDataFetcher`                              | —                        | 分页、搜索和回显取数函数        |
| `options`     | `Record<string, any>[]`                               | `[]`                     | 本地固定选项                    |
| `dictCode`    | `string`                                              | —                        | 字典编码；未传 `fetcher` 时使用 |
| `columns`     | `ColumnsItem[]`                                       | `[]`                     | 弹窗列表列配置                  |
| `valueKey`    | `string`                                              | `'id'`                   | 选项值字段名                    |
| `labelKey`    | `string`                                              | 自动取第一列或 `'label'` | 选项标签字段名                  |
| `subtitleKey` | `string`                                              | `''`                     | 副标题字段名                    |
| `placeholder` | `string`                                              | 内置文案                 | 占位文案                        |
| `disabled`    | `boolean`                                             | `false`                  | 是否禁用                        |
| `dialogTitle` | `string`                                              | 内置文案                 | 弹窗标题                        |
| `perPage`     | `number`                                              | `20`                     | 下拉与弹窗分页条数              |

## BaseCard

`BaseCard` 没有自定义 Props。除 `shadow` 由 `setupDisguise({ cardShadow })` 控制外，其他属性、事件和插槽全部透传给 Element Plus `ElCard`。

## CrudPage

| 属性                 | 类型                                          | 默认值                     | 说明                                                |
| -------------------- | --------------------------------------------- | -------------------------- | --------------------------------------------------- |
| `fields`             | `CrudPageItem[]`                              | `[]`                       | 字段元数据                                          |
| `data`               | `Record[] \| TableEntityDataFetcher`          | `[]`                       | 表格数据或异步取数函数                              |
| `rowKey`             | `string`                                      | `'id'`                     | 行唯一字段                                          |
| `actions`            | `TableEntityActionName[]`                     | 按处理函数推导             | 行操作按钮                                          |
| `pushToolbarActions` | `CrudPageToolbarAction[]`                     | `[]`                       | 追加工具栏操作                                      |
| `createTitle`        | `string`                                      | `'新增'`                   | 新增抽屉标题                                        |
| `editTitle`          | `string`                                      | `'编辑'`                   | 编辑抽屉标题                                        |
| `viewTitle`          | `string`                                      | `'详情'`                   | 查看抽屉标题                                        |
| `addButtonText`      | `string`                                      | `'新增'`                   | 新增按钮文案                                        |
| `permissionCode`     | `string`                                      | —                          | 权限编码前缀                                        |
| `showImport`         | `boolean`                                     | `true`                     | 是否显示导入                                        |
| `showExport`         | `boolean`                                     | `true`                     | 是否显示导出                                        |
| `importUrl`          | `string \| ImportDialogUrlConfig`             | —                          | 导入接口配置                                        |
| `exportUrl`          | `string`                                      | —                          | 导出接口地址（当前未接入，导出请用 `exportConfig`） |
| `defaultValues`      | `Record<string, any>`                         | `{}`                       | 新增默认值                                          |
| `confirmDelete`      | `boolean`                                     | `true`                     | 删除前是否确认                                      |
| `deleteConfirmText`  | `string \| ((row) => string)`                 | `'确定要删除这条数据吗？'` | 删除确认文案                                        |
| `tableProps`         | `Partial<TableEntityProps>`                   | `{}`                       | 表格属性                                            |
| `searchFormProps`    | `CrudPageSearchFormProps`                     | `{}`                       | 搜索表单属性                                        |
| `drawerProps`        | `Partial<DrawerFormPageProps>`                | `{}`                       | 抽屉属性                                            |
| `onCreate`           | `(values) => boolean \| void \| Promise`      | —                          | 新增处理函数                                        |
| `onUpdate`           | `(values, row) => boolean \| void \| Promise` | —                          | 编辑处理函数                                        |
| `onDelete`           | `(row) => boolean \| void \| Promise`         | —                          | 单行删除处理函数                                    |
| `onBatchDelete`      | `(rows) => boolean \| void \| Promise`        | —                          | 批量删除处理函数                                    |
| `exportConfig`       | `ExportConfig`                                | —                          | 自定义导出配置                                      |
| `resolveFormValues`  | `(mode, row?) => Record \| Promise<Record>`   | —                          | 打开编辑或详情前补充数据                            |

### CrudPageSearchFormProps

`collapsedRows`、`columns`、`disabled`、`labelAlign`、`labelPosition`、`labelWidth`、`schema`、`showActions`，含义与 `SearchForm` 同名属性一致。

### ExportConfig

| 字段       | 类型                                | 说明                                                                                        |
| ---------- | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `url`      | `string`                            | 导出下载地址                                                                                |
| `name`     | `string`                            | 兜底文件名，默认 `export.xlsx`                                                              |
| `method`   | `string`                            | 预留字段，当前导出固定走 `requestClient.download`                                           |
| `onExport` | `({ rows, queryParmas }) => Record` | 返回随请求提交的参数；`rows` 为勾选行，`queryParmas` 为当前搜索条件（字段名与类型定义一致） |

## DialogList

| 属性           | 类型                                    | 默认值    | 说明                                        |
| -------------- | --------------------------------------- | --------- | ------------------------------------------- |
| `visible`      | `boolean`                               | —         | 弹窗显隐                                    |
| `modelValue`   | `any \| any[]`                          | —         | 当前选中值                                  |
| `multiple`     | `boolean`                               | `true`    | 是否多选                                    |
| `fetcher`      | `(params) => Promise<{ items, total }>` | —         | 分页取数函数                                |
| `columns`      | `ColumnsItem[]`                         | `[]`      | 列配置                                      |
| `rowKey`       | `string`                                | `'id'`    | 行唯一字段                                  |
| `dialogTitle`  | `string`                                | `''`      | 弹窗标题                                    |
| `dialogWidth`  | `number \| string`                      | `'960px'` | 弹窗宽度                                    |
| `tableHeight`  | `number`                                | `420`     | 表格高度                                    |
| `perPage`      | `number`                                | `20`      | 每页条数                                    |
| `filterParams` | `Record<string, any>`                   | `{}`      | 作为 `params` 传给 `fetcher` 的额外筛选条件 |

## DictTag

| 属性       | 类型                       | 默认值 | 说明                             |
| ---------- | -------------------------- | ------ | -------------------------------- |
| `code`     | `string`                   | `''`   | 字典编码                         |
| `dictType` | `string`                   | `''`   | `code` 的兼容别名                |
| `value`    | `string \| number \| null` | `null` | 字典值                           |
| `label`    | `string \| number \| null` | `null` | 直接指定显示文字，优先于字典结果 |
| `color`    | `string \| null`           | `null` | 语义色或 CSS 颜色                |

## DisguiseIcon

| 属性        | 类型     | 默认值           | 说明             |
| ----------- | -------- | ---------------- | ---------------- |
| `icon`      | `string` | `''`             | 图标名           |
| `className` | `string` | `'disguiseicon'` | 字体图标类名前缀 |

其余属性透传给 `ElIcon`。

## DrawerFormPage

| 属性                 | 类型                               | 默认值     | 说明                               |
| -------------------- | ---------------------------------- | ---------- | ---------------------------------- |
| `modelValue`         | `boolean`                          | `false`    | 抽屉显隐                           |
| `title`              | `string`                           | `''`       | 标题                               |
| `breadcrumb`         | `string`                           | —          | 标题上方路径文字                   |
| `statusText`         | `string`                           | 按模式生成 | 标题右侧状态                       |
| `mode`               | `'create' \| 'edit' \| 'view'`     | `'create'` | 表单模式                           |
| `schema`             | `SchemaFormItem[]`                 | `[]`       | 字段配置                           |
| `formValues`         | `Record<string, any>`              | `{}`       | 表单值                             |
| `size`               | `number \| string`                 | `'560px'`  | 普通模式宽度                       |
| `direction`          | `'btt' \| 'ltr' \| 'rtl' \| 'ttb'` | `'rtl'`    | 打开方向                           |
| `fullscreenButton`   | `boolean`                          | `true`     | 是否显示全屏按钮                   |
| `fullscreen`         | `boolean`                          | `false`    | 是否全屏                           |
| `normalColumns`      | `number`                           | 表单列数   | 普通模式列数                       |
| `fullscreenColumns`  | `number`                           | 至少 `3`   | 全屏模式列数                       |
| `showFooter`         | `boolean`                          | `true`     | 是否显示底部操作栏                 |
| `showCancelButton`   | `boolean`                          | `true`     | 是否显示取消按钮                   |
| `showSubmitButton`   | `boolean`                          | `true`     | 是否显示提交按钮；查看模式始终隐藏 |
| `cancelText`         | `string`                           | `'取消'`   | 取消文案                           |
| `submitText`         | `string`                           | `'确定'`   | 提交文案                           |
| `loading`            | `boolean`                          | `false`    | 内容加载状态                       |
| `submitting`         | `boolean`                          | `false`    | 提交状态                           |
| `disabled`           | `boolean`                          | `false`    | 是否禁用整表                       |
| `destroyOnClose`     | `boolean`                          | `false`    | 关闭后是否销毁内容                 |
| `closeOnClickModal`  | `boolean`                          | `true`     | 点击遮罩是否关闭                   |
| `closeOnPressEscape` | `boolean`                          | `true`     | Esc 是否关闭                       |
| `appendToBody`       | `boolean`                          | `true`     | 是否挂载到 body                    |
| `lockScroll`         | `boolean`                          | `true`     | 是否锁定页面滚动                   |
| `drawerProps`        | `Record<string, any>`              | `{}`       | 透传给 `ElDrawer`                  |
| `schemaFormProps`    | `DrawerFormSchemaProps`            | `{}`       | 透传给 `SchemaForm`                |

## FileUpload

| 属性           | 类型                                           | 默认值                 | 说明                                                                 |
| -------------- | ---------------------------------------------- | ---------------------- | -------------------------------------------------------------------- |
| `modelValue`   | `string \| AttachmentData \| AttachmentData[]` | `''`                   | 文件值                                                               |
| `disabled`     | `boolean`                                      | `false`                | 是否禁用                                                             |
| `maxSize`      | `number`                                       | `2000`                 | 单个文件大小上限，MB                                                 |
| `accept`       | `string[]`                                     | `[]`                   | 允许的文件类型，`[]` 表示不限制；支持 `image/*` 通配和 `.pdf` 扩展名 |
| `width`        | `number`                                       | `200`                  | 文件项宽度，px；预留属性，当前版本未参与样式计算                     |
| `height`       | `number`                                       | `40`                   | 文件项高度，px；预留属性，当前版本未参与样式计算                     |
| `showPreview`  | `boolean`                                      | `true`                 | 是否显示预览                                                         |
| `showDownload` | `boolean`                                      | `true`                 | 是否显示下载                                                         |
| `showRemove`   | `boolean`                                      | `true`                 | 是否显示删除                                                         |
| `fileName`     | `string`                                       | —                      | 自定义显示文件名                                                     |
| `placeholder`  | `string`                                       | 内置文案（`点击上传`） | 占位文案                                                             |
| `selected`     | `boolean`                                      | `false`                | 是否显示选中状态                                                     |
| `errorMessage` | `string`                                       | `''`                   | 错误状态文案                                                         |
| `maxCount`     | `number`                                       | `1`                    | 最大文件数；大于 1 时启用多文件模式                                  |

## ImageUpload

| 属性         | 类型       | 默认值                                                       | 说明                         |
| ------------ | ---------- | ------------------------------------------------------------ | ---------------------------- |
| `modelValue` | `string`   | `''`                                                         | 图片 URL                     |
| `accept`     | `string[]` | `['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']` | 允许的 MIME 类型（精确匹配） |
| `disabled`   | `boolean`  | `false`                                                      | 是否禁用                     |
| `height`     | `number`   | `96`                                                         | 预览高度，px                 |
| `maxSize`    | `number`   | `5`                                                          | 大小上限，MB                 |
| `width`      | `number`   | `96`                                                         | 预览宽度，px                 |

## ImagesView

| 属性       | 类型       | 默认值 | 说明           |
| ---------- | ---------- | ------ | -------------- |
| `images`   | `string[]` | `[]`   | 图片地址       |
| `size`     | `number`   | `80`   | 缩略图边长，px |
| `maxStack` | `number`   | `3`    | 最大叠放层数   |
| `offset`   | `number`   | `6`    | 每层偏移量，px |

## ImportDialog

| 属性              | 类型                                             | 默认值              | 说明                                     |
| ----------------- | ------------------------------------------------ | ------------------- | ---------------------------------------- |
| `modelValue`      | `boolean`                                        | `false`             | 弹窗显隐                                 |
| `api`             | `string`                                         | —                   | 导入上传接口                             |
| `templateUrl`     | `string`                                         | —                   | 模板下载接口                             |
| `templateMethod`  | `'GET' \| 'POST'`                                | `'POST'`            | 模板下载方法                             |
| `templateName`    | `string`                                         | `'导入模版'`        | 下载的模板文件名                         |
| `title`           | `string`                                         | 内置文案            | 标题                                     |
| `defaultMode`     | `ImportDialogMode`                               | `'create'`          | 默认导入模式                             |
| `modes`           | `ImportDialogModeOption[]`                       | 内置新增、更新      | 导入模式列表；当前无选择入口             |
| `accept`          | `string[]`                                       | `['.xls', '.xlsx']` | 允许的扩展名                             |
| `maxSize`         | `number`                                         | `5`                 | 文件大小上限，MB                         |
| `maxPreviewCount` | `number`                                         | `100`               | 预览汇总文案中的最大统计行数             |
| `tips`            | `string[]`                                       | 内置文案            | 上传提示                                 |
| `importDesc`      | `string`                                         | —                   | 导入说明文字，未传不显示                 |
| `skipSteps`       | `Array<'preview' \| 'mapping'>`                  | `[]`                | 跳过的流程步骤，跳过后上传确认即直接导入 |
| `targetFields`    | `ImportDialogTargetField[]`                      | `[]`                | 目标字段                                 |
| `parseFile`       | `(payload) => Promise<ImportDialogParseResult>`  | —                   | 自定义解析                               |
| `submitImport`    | `(payload) => Promise<ImportDialogSubmitResult>` | —                   | 自定义提交                               |
| `resetOnClose`    | `boolean`                                        | `true`              | 关闭后是否重置                           |

事件：`update:modelValue`、`downloadTemplate`、`fileChange`、`success`、`error`、`cancel`。无插槽、无暴露方法。

## PictureUpload

| 属性           | 类型                                                       | 默认值        | 说明                                                   |
| -------------- | ---------------------------------------------------------- | ------------- | ------------------------------------------------------ |
| `modelValue`   | `string \| string[] \| AttachmentData \| AttachmentData[]` | `''`          | 图片值；为数组时进入多图模式                           |
| `disabled`     | `boolean`                                                  | `false`       | 是否禁用                                               |
| `maxSize`      | `number`                                                   | `5`           | 单图大小上限，MB                                       |
| `accept`       | `string[]`                                                 | `['image/*']` | 允许的图片类型                                         |
| `width`        | `number`                                                   | `96`          | 预览宽度，px                                           |
| `height`       | `number`                                                   | `96`          | 预览高度，px                                           |
| `showPreview`  | `boolean`                                                  | `true`        | 是否显示预览                                           |
| `showDownload` | `boolean`                                                  | `true`        | 是否显示下载                                           |
| `showRemove`   | `boolean`                                                  | `true`        | 是否显示删除                                           |
| `selected`     | `boolean`                                                  | `false`       | 是否显示选中状态                                       |
| `errorMessage` | `string`                                                   | `''`          | 错误状态文案                                           |
| `baseFolder`   | `string`                                                   | `''`          | OSS 保存目录，相对 `attachment/v3`                     |
| `addWatermark` | `boolean`                                                  | —             | 是否给图片加中心水印                                   |
| `maxCount`     | `number`                                                   | `1`           | 最大图片数；大于 1 或 `v-model` 为数组时启用多图模式   |
| `crop`         | `PictureCropOptions`                                       | —             | 上传前裁剪配置；支持开关、固定比例、结果格式和输出质量 |
| `dimensions`   | `PictureDimensionOptions`                                  | —             | 最终图片固定或最小/最大像素尺寸限制                    |

`PictureCropOptions`：`enabled?`、`aspectRatio?`、`aspectRatios?`、`mimeType?`、`quality?`。`aspectRatios` 的元素格式为 `{ label: string, value: number | null }`，其中 `null` 表示自由比例。

`PictureDimensionOptions`：`width?`、`height?`、`minWidth?`、`minHeight?`、`maxWidth?`、`maxHeight?`。

插槽：`placeholder`（或默认插槽）、`loading`、`picture`。详见 [PictureUpload](/components/picture-upload)。

## RichTextEditor

| 属性            | 类型                      | 默认值    | 说明                       |
| --------------- | ------------------------- | --------- | -------------------------- |
| `modelValue`    | `string`                  | `''`      | HTML 内容                  |
| `editable`      | `boolean`                 | `true`    | 是否可编辑                 |
| `placeholder`   | `string`                  | 内置文案  | 占位文案                   |
| `maxHeight`     | `string`                  | `'400px'` | 编辑区域最大高度           |
| `richTextTools` | `RichTextTool[]`          | `[]`      | 自定义工具                 |
| `toolContext`   | `Record<string, unknown>` | `{}`      | 传给自定义工具的额外上下文 |

事件 `update:modelValue(html: string)`；插槽 `toolbar-append`；暴露 `editor`、`clearFormat()`。详见 [RichTextEditor](/components/rich-text-editor)。

## SchemaForm

| 属性            | 类型                            | 默认值     | 说明                   |
| --------------- | ------------------------------- | ---------- | ---------------------- |
| `modelValue`    | `Record<string, any>`           | `{}`       | 表单数据               |
| `columns`       | `number`                        | `1`        | 栅格列数               |
| `disabled`      | `boolean`                       | `false`    | 是否禁用整表           |
| `underline`     | `boolean`                       | `false`    | 输入框是否只显示下边框 |
| `labelAlign`    | `'center' \| 'left' \| 'right'` | —          | 标签文字对齐           |
| `itemGap`       | `number \| string`              | `30`       | 表单项纵向间距         |
| `groupGap`      | `number \| string`              | `0`        | 分组额外间距           |
| `labelGap`      | `number \| string`              | `20`       | 标签与控件间距         |
| `labelPosition` | `'left' \| 'right' \| 'top'`    | `'top'`    | 标签位置               |
| `labelWidth`    | `number \| string`              | `'auto'`   | 标签宽度               |
| `loading`       | `boolean`                       | `false`    | 加载状态               |
| `mode`          | `'create' \| 'edit' \| 'view'`  | `'create'` | 表单模式               |
| `schema`        | `SchemaFormItem[]`              | `[]`       | 字段配置               |

事件 `update:modelValue(values)`、`field-change(field, value)`；动态插槽（名等于字段 `prop`，仅 `type: 'slot'` 渲染）参数为 `{ field, value, disabled, updateValue }`；暴露 `validate()`、`clearValidate()`、`resetFields()`、`getValues()`。详见 [SchemaForm](/components/schema-form)。

### SchemaForm 字段属性

| 属性              | 类型                              | 默认值          | 说明                   |
| ----------------- | --------------------------------- | --------------- | ---------------------- |
| `type`            | `FieldType`                       | —               | 控件类型               |
| `prop`            | `string`                          | —               | 表单字段名             |
| `label`           | `string`                          | —               | 标签                   |
| `component`       | `Component \| string \| config`   | —               | 自定义组件             |
| `copyable`        | `boolean`                         | 跟随 `readonly` | 只读时是否显示复制按钮 |
| `defaultValue`    | `any`                             | —               | 默认值                 |
| `disabled`        | `boolean \| (context) => boolean` | `false`         | 是否禁用               |
| `hideOnCreate`    | `boolean`                         | `false`         | 新增时隐藏             |
| `hideOnEdit`      | `boolean`                         | `false`         | 编辑时隐藏             |
| `hidden`          | `boolean \| (context) => boolean` | `false`         | 是否隐藏               |
| `newRow`          | `boolean`                         | `false`         | 是否另起一行           |
| `placeholder`     | `string`                          | 自动生成        | 占位文案               |
| `props`           | `Record \| (context) => Record`   | `{}`            | 底层控件属性           |
| `readonly`        | `boolean`                         | `false`         | 是否只读               |
| `required`        | `boolean \| (context) => boolean` | `false`         | 是否必填               |
| `rules`           | `FormItemRule[]`                  | `[]`            | 校验规则               |
| `span`            | `number`                          | 按列数均分      | 24 栅格占位            |
| `tip`             | `string`                          | —               | 控件下提示             |
| `translateConfig` | `TranslateConfig`                 | —               | 多语言编辑配置         |
| `apiOptions`      | `ApiFieldOptions`                 | —               | 异步选择配置           |
| `dictCode`        | `string`                          | —               | 字典编码               |
| `optionSource`    | `'api' \| 'dict' \| 'static'`     | —               | 选项来源               |
| `options`         | `FieldOption[] \| resolver`       | —               | 静态或动态选项         |

### SchemaForm 分组属性

| 属性           | 类型                     | 默认值  | 说明             |
| -------------- | ------------------------ | ------- | ---------------- |
| `type`         | `'group'`                | —       | 固定值           |
| `label`        | `string`                 | —       | 分组标签         |
| `children`     | `SchemaFormGroupChild[]` | —       | 子字段           |
| `description`  | `string`                 | —       | 锚点分组说明     |
| `disabled`     | `FieldCondition`         | `false` | 整组禁用         |
| `hideOnCreate` | `boolean`                | `false` | 新增时隐藏       |
| `hideOnEdit`   | `boolean`                | `false` | 编辑时隐藏       |
| `hidden`       | `FieldCondition`         | `false` | 是否隐藏         |
| `anchor`       | `boolean`                | `false` | 是否加入锚点导航 |
| `newRow`       | `boolean`                | `false` | 是否另起一行     |
| `span`         | `number`                 | `24`    | 24 栅格占位      |
| `tip`          | `string`                 | —       | 辅助提示         |

## SearchForm

| 属性            | 类型                            | 默认值     | 说明                         |
| --------------- | ------------------------------- | ---------- | ---------------------------- |
| `modelValue`    | `Record<string, any>`           | `{}`       | 搜索值                       |
| `collapsedRows` | `number`                        | `2`        | 收起时显示行数               |
| `columns`       | `number`                        | `4`        | 列数                         |
| `disabled`      | `boolean`                       | `false`    | 是否禁用                     |
| `labelAlign`    | `'center' \| 'left' \| 'right'` | `'left'`   | 标签文字对齐                 |
| `labelPosition` | `'left' \| 'right' \| 'top'`    | `'left'`   | 标签位置                     |
| `labelWidth`    | `number \| string`              | `'auto'`   | 标签宽度                     |
| `mode`          | `'create' \| 'edit' \| 'view'`  | `'create'` | 字段联动模式                 |
| `schema`        | `SearchFormItem[]`              | `[]`       | 搜索字段                     |
| `showActions`   | `boolean`                       | `true`     | 是否显示搜索、重置和展开按钮 |

## TableEntity

| 属性                     | 类型                                 | 默认值               | 说明               |
| ------------------------ | ------------------------------------ | -------------------- | ------------------ |
| `columns`                | `ColumnsItem[]`                      | `[]`                 | 列配置             |
| `data`                   | `Record[] \| TableEntityDataFetcher` | `[]`                 | 数据或异步取数函数 |
| `height`                 | `number`                             | `630`                | 表格高度           |
| `rowHeight`              | `number`                             | `40`                 | 行高               |
| `cache`                  | `number`                             | `1`                  | 可视区外预渲染行数 |
| `width`                  | `number`                             | 容器宽度             | 表格宽度           |
| `selectable`             | `boolean`                            | `true`               | 是否可选择         |
| `multiple`               | `boolean`                            | `true`               | 是否多选           |
| `rowKey`                 | `string`                             | `'id'`               | 行唯一字段         |
| `selectedKeys`           | `any[]`                              | `[]`                 | 已选 key           |
| `tree`                   | `boolean`                            | `false`              | 是否树形表格       |
| `treeChildrenKey`        | `string`                             | `'children'`         | 子节点字段         |
| `expandColumnKey`        | `string`                             | `''`                 | 展开列字段         |
| `expandedRowKeys`        | `TableEntityRowKey[]`                | —                    | 受控展开行         |
| `defaultExpandedRowKeys` | `TableEntityRowKey[]`                | `[]`                 | 默认展开行         |
| `indentSize`             | `number`                             | `12`                 | 树节点缩进         |
| `iconSize`               | `number`                             | `12`                 | 展开图标尺寸       |
| `total`                  | `number`                             | 异步结果或 `0`       | 总条数             |
| `per_page`               | `number`                             | `100`                | 每页条数           |
| `current_page`           | `number`                             | `1`                  | 当前页             |
| `query`                  | `Record<string, any>`                | `{}`                 | 异步查询条件       |
| `showPagination`         | `boolean`                            | `true`               | 是否显示分页       |
| `showActions`            | `boolean`                            | `true`               | 是否显示操作列     |
| `maxVisibleActions`      | `number`                             | —                    | 已废弃兼容属性     |
| `actionColumnWidth`      | `number`                             | —                    | 操作列宽配置       |
| `actionColumnTitle`      | `string`                             | `''`                 | 操作列标题         |
| `actions`                | `TableEntityActionName[]`            | `['edit', 'delete']` | 内置操作           |
| `pushActions`            | `TableEntityPushAction[]`            | `[]`                 | 追加操作           |
| `rowDraggable`           | `boolean`                            | `false`              | 是否可拖动排序     |
| `rowDragHandle`          | `string`                             | —                    | 拖动把手选择器     |
| `rowDragDisabled`        | `(row) => boolean`                   | —                    | 禁止拖动判断       |
| `resizable`              | `boolean`                            | `true`               | 是否可调整列宽     |
| `minColumnWidth`         | `number`                             | `30`                 | 最小列宽           |
| `showColumnSettings`     | `boolean`                            | `true`               | 是否显示列设置     |
| `permissionCode`         | `string`                             | `''`                 | 权限编码前缀       |
| `importDialog`           | `TableEntityImportDialogConfig`      | —                    | 内置导入弹窗配置   |

### ColumnsItem 扩展属性

除 Element Plus `Column` 属性外，还支持 `width`、`dataKey`、`dataIndex`、`headerAlign`、`verticalAlign`、`type`、`dictCode`、`dictType`、`maxPreviewCount`、`cellProps`、`props`、`sortable`、`sortOrder` 和 `valueType`。

事件：`update:selectedKeys`、`selection-change`、`update:current_page`、`update:page`、`pageChange`、`update:per_page`、`change`、`refresh`、`handle-action`、`update:expandedRowKeys`、`expandedRowsChange`、`rowExpand`、`rowSort`、`importSuccess`、`importError`。插槽：`buttons`、`{dataKey}Col`（`{dataKey}` 为列字段名）、`actionsCol`。暴露 `reload(page?)`、`getSelectedRows()`、`clearSelection()`、`getSelectedCount()`、`setSelectedKeys(keys)`、`openImport()`。详见 [TableEntity](/components/table-entity)。

## UserAvatarInfo

| 属性               | 类型                      | 默认值   | 说明                                                                           |
| ------------------ | ------------------------- | -------- | ------------------------------------------------------------------------------ |
| `userId`           | `number \| string`        | —        | 用户 ID；传入后展示在线状态角标                                                |
| `name`             | `string`                  | —        | 展示名称                                                                       |
| `nickName`         | `string`                  | `''`     | 昵称，优先于 `name` 展示                                                       |
| `subtitle`         | `string`                  | `''`     | 副标题，优先于 `deptName`                                                      |
| `deptName`         | `string`                  | `''`     | 部门名称                                                                       |
| `src`              | `string`                  | —        | 头像地址                                                                       |
| `gender`           | `UserAvatarGenderInput`   | —        | 性别；`'male'` / `'female'` 时展示角标并着色                                   |
| `sex`              | `string`                  | `''`     | 性别编码，`'0'` 男 / `'1'` 女                                                  |
| `size`             | `number`                  | `30`     | 头像尺寸                                                                       |
| `avatar`           | `Record<string, unknown>` | —        | 透传给 `ElAvatar`                                                              |
| `drawerAvatarSize` | `number`                  | `64`     | 抽屉头像尺寸                                                                   |
| `age`              | `number \| string`        | —        | 年龄                                                                           |
| `workYears`        | `number \| string`        | —        | 工龄                                                                           |
| `email`            | `string`                  | —        | 邮箱（抽屉详情展示）                                                           |
| `phone`            | `string`                  | —        | 手机号（抽屉详情展示）                                                         |
| `department`       | `string`                  | —        | 部门（抽屉详情展示，未传时回退 `deptName`）                                    |
| `jobLevel`         | `string`                  | —        | 职级                                                                           |
| `enableDrawer`     | `boolean`                 | `true`   | 是否允许打开详情抽屉                                                           |
| `drawerTitle`      | `string`                  | 内置文案 | 抽屉标题                                                                       |
| `drawerSize`       | `number \| string`        | `'40%'`  | 抽屉宽度                                                                       |
| `drawerProps`      | `Record<string, unknown>` | —        | 透传给 `ElDrawer`                                                              |
| `drawerFields`     | `UserAvatarDrawerField[]` | —        | 抽屉详情卡片字段配置，优先于全局 `userAvatarDrawerFields`，不传时为默认 8 字段 |
| `drawerVisible`    | `boolean`                 | `false`  | 详情抽屉显隐模型                                                               |

事件：`update:drawerVisible`。插槽：`avatar`、`name`、`subtitle`、`default`、`drawer-avatar`、`drawer-name`。暴露方法：`openDrawer()`、`closeDrawer()`。 `UserAvatarDrawerField`：`{ key, label?, icon?, value? }`，用于配置抽屉详情卡片字段，也可通过 `setupDisguise({ userAvatarDrawerFields })` 全局注入。
