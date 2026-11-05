# SchemaForm 元数据表单

用一份纯数据的 schema 描述表单。组件负责渲染控件、生成校验规则、处理只读态与字段联动。

<script setup>
import Basic from './demos/schema-form-basic.vue'
import basicSource from './demos/schema-form-basic.vue?raw'
import Linkage from './demos/schema-form-linkage.vue'
import linkageSource from './demos/schema-form-linkage.vue?raw'
import Options from './demos/schema-form-options.vue'
import optionsSource from './demos/schema-form-options.vue?raw'
import RichText from './demos/schema-form-rich-text.vue'
import richTextSource from './demos/schema-form-rich-text.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="basicSource">
    <Basic />
  </DemoBlock>
</ClientOnly>

## 字段联动

`hidden`、`disabled`、`required`、`options`、`props` 都可以传函数，参数里有当前模式和全量表单值。

<ClientOnly>
  <DemoBlock :source="linkageSource">
    <Linkage />
    <template #description>
      选择「外链」后才会出现链接地址和打开方式，并且链接变为必填。
    </template>
  </DemoBlock>
</ClientOnly>

## 控件类型

与代码中的 `FieldType` 枚举一一对应（外加分组容器 `group`）：

| type                | 渲染              | 说明                                                                  |
| ------------------- | ----------------- | --------------------------------------------------------------------- |
| `text`              | `ElInput`         | 带 clearable                                                          |
| `textarea`          | `ElInput`         | 多行，默认 4 行                                                       |
| `number`            | `ElInputNumber`   | 数字                                                                  |
| `cascader`          | `ElCascader`      | 默认开启 `filterable`，其他属性通过 `props` 透传                      |
| `select`            | `AsyncSelect`     | 本地选项下拉，支持搜索与弹窗选择；需要 `options` 或 `dictCode`        |
| `radio`             | `ElRadioGroup`    | 需要 `options` 或 `dictCode`                                          |
| `checkbox`          | `ElCheckboxGroup` | 同上，值为数组                                                        |
| `switch`            | `ElSwitch`        | 开关                                                                  |
| `date` / `datetime` | `ElDatePicker`    | 值格式 `YYYY-MM-DD` / `YYYY-MM-DD HH:mm:ss`                           |
| `picture`           | `PictureUpload`   | 图片上传，配置走 `props`                                              |
| `file` / `upload`   | `FileUpload`      | 附件上传，配置走 `props`                                              |
| `async-select`      | `AsyncSelect`     | 需要 `apiOptions`，或 `optionSource: 'dict'` + `dictCode`             |
| `rich-text`         | `RichTextEditor`  | 富文本，可叠加 `translateConfig` 多语言                               |
| `slot`              | 自定义            | 插槽名等于 `prop`                                                     |
| `component`         | 注册的自定义组件  | 需要 `component` 指定组件，可先用 `registerSchemaFormComponents` 注册 |
| `group`             | 容器              | 一个 label 下并排多个控件                                             |

未内置的类型（日期区间、纯时间、密码框等）暂时用 `slot` 接。

## 选项来源

`select`、`radio`、`checkbox` 的选项有三个来源，用 `optionSource` 区分：不写或 `'static'` 读字段上的 `options`；`'dict'` 用 `dictCode` 读项目字典缓存；接口取数请改用 `async-select` 类型 + `apiOptions`。`options` 的元素为 `{ label, value, flag? }`，也可以传 `(ctx) => FieldOption[]` 按表单值动态计算。

<ClientOnly>
  <DemoBlock :source="optionsSource">
    <Options />
    <template #description>
      依次是静态选项（radio）、字典选项（sys_user_sex）和远程选项（实体 dept）。
    </template>
  </DemoBlock>
</ClientOnly>

## Props

| 名称            | 类型                            | 默认值     | 说明                      |
| --------------- | ------------------------------- | ---------- | ------------------------- |
| `modelValue`    | `Record<string, any>`           | `{}`       | 表单值，用 `v-model` 绑定 |
| `schema`        | `SchemaFormItem[]`              | `[]`       | 字段元数据                |
| `mode`          | `'create' \| 'edit' \| 'view'`  | `'create'` | 影响显隐与只读            |
| `columns`       | `number`                        | `1`        | 栅格列数                  |
| `underline`     | `boolean`                       | `false`    | 输入控件是否只显示下边框  |
| `labelAlign`    | `'center' \| 'left' \| 'right'` | —          | 标签文字对齐              |
| `itemGap`       | `number \| string`              | `30`       | 表单项纵向间距            |
| `groupGap`      | `number \| string`              | `0`        | 分组额外上下间距          |
| `labelGap`      | `number \| string`              | `20`       | 标签与控件间距            |
| `labelWidth`    | `number \| string`              | `'auto'`   | 标签宽度                  |
| `labelPosition` | `'left' \| 'right' \| 'top'`    | `'top'`    | 标签位置                  |
| `disabled`      | `boolean`                       | `false`    | 整体禁用                  |
| `loading`       | `boolean`                       | `false`    | 加载遮罩                  |

查看态只要传 `mode="view"`，schema 不用改。

`picture` 字段支持在 `props` 中配置 `crop` 与 `dimensions`，实现用户裁剪后再校验最终尺寸：

```ts
{
  prop: 'cover',
  label: '封面',
  type: 'picture',
  props: {
    maxSize: 5,
    accept: ['image/jpeg', 'image/png', 'image/webp'],
    crop: {
      enabled: true,
      aspectRatio: 16 / 9,
      aspectRatios: [
        { label: '1:1', value: 1 },
        { label: '4:3', value: 4 / 3 },
        { label: '16:9', value: 16 / 9 },
      ],
      quality: 0.9,
    },
    dimensions: { width: 1600, height: 900 },
  },
}
```

完整配置见 [PictureUpload 图片上传](/components/picture-upload)。

## Events

| 名称                | 参数                               | 说明                                                                 |
| ------------------- | ---------------------------------- | -------------------------------------------------------------------- |
| `update:modelValue` | `values: Record<string, any>`      | 字段值变化；使用 `v-model` 时自动绑定                                |
| `field-change`      | `field: ResolvedField, value: any` | 任一字段被用户修改时触发，参数为该字段配置与新值（默认值填充不触发） |

## Slots

字段使用动态插槽：插槽名等于字段 `prop`，仅 `type: 'slot'` 的字段会渲染该插槽。

| 名称                | 插槽参数                                                                                     | 说明                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 字段 `prop`（动态） | `{ field: ResolvedField, value: any, disabled: boolean, updateValue: (value: any) => void }` | 自定义该字段的编辑控件；`disabled` 为合并表单、分组与字段后的禁用状态 |

## Schema 字段属性

| 名称                          | 类型                                          | 默认值          | 说明                                                                                                                                          |
| ----------------------------- | --------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`                        | `FieldType`                                   | —               | 控件类型                                                                                                                                      |
| `prop`                        | `string`                                      | —               | 表单字段名，同时也是动态插槽名                                                                                                                |
| `label`                       | `string`                                      | —               | 字段标签                                                                                                                                      |
| `component`                   | `Component \| string \| config`               | —               | 覆盖内置控件，或配合 `type: 'component'` 使用注册组件；字符串为 `registerSchemaFormComponents` 的注册名                                       |
| `defaultValue`                | `any`                                         | —               | 仅在字段 key 不存在时填充的默认值；用户主动清空后不会回填                                                                                     |
| `disabled`                    | `boolean \| (context) => boolean`             | `false`         | 是否禁用                                                                                                                                      |
| `hidden`                      | `boolean \| (context) => boolean`             | `false`         | 是否隐藏；隐藏字段不会出现在 `getValues()` 中                                                                                                 |
| `hideOnCreate` / `hideOnEdit` | `boolean`                                     | `false`         | 在对应模式隐藏，等价于判断 `ctx.mode`                                                                                                         |
| `readonly`                    | `boolean`                                     | `false`         | 是否以纯文本呈现；`mode="view"` 时整表只读                                                                                                    |
| `copyable`                    | `boolean`                                     | 跟随 `readonly` | 只读态是否显示复制按钮                                                                                                                        |
| `required`                    | `boolean \| (context) => boolean`             | `false`         | 是否必填，自动生成规则并与 `rules` 合并                                                                                                       |
| `rules`                       | `FormItemRule[]`                              | `[]`            | Element Plus 校验规则；`validator` 的第四个参数为整表值                                                                                       |
| `placeholder`                 | `string`                                      | 自动生成        | 占位文字；选择类用「请选择 xxx」，输入类用「请输入 xxx」                                                                                      |
| `props`                       | `Record \| (context) => Record`               | `{}`            | 透传给底层控件的属性；函数形态的 context 为 `{ mode, values, updateValue }`                                                                   |
| `span`                        | `number`                                      | 按列数均分      | 24 栅格占位                                                                                                                                   |
| `newRow`                      | `boolean`                                     | `false`         | 是否强制另起一行                                                                                                                              |
| `tip`                         | `string`                                      | —               | 控件下方提示                                                                                                                                  |
| `translateConfig`             | `TranslateConfig`                             | —               | 多语言编辑配置，见下表                                                                                                                        |
| `options`                     | `FieldOption[] \| (context) => FieldOption[]` | —               | 静态或动态选项，元素为 `{ label, value, flag? }`                                                                                              |
| `dictCode`                    | `string`                                      | —               | 字典选项编码                                                                                                                                  |
| `optionSource`                | `'static' \| 'dict' \| 'api'`                 | 按字段推断      | 选项来源；`dict` 必须同时写 `dictCode`，`api` 来自 `apiOptions`                                                                               |
| `apiOptions`                  | `ApiFieldOptions`                             | —               | `async-select` 的远程选择配置，`entityKey` 必填，可选 `labelKey`、`valueKey`、`subtitleKey`、`multiple`、`params`（对象或 `(ctx) => Record`） |

布尔形态的 `disabled`、`hidden`、`required` 传函数时，参数为 `{ mode, values }`。

`translateConfig` 仅对 `text`、`textarea`、`rich-text` 生效：

| 名称        | 类型                                       | 默认值                                                       | 说明                                                           |
| ----------- | ------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------- |
| `language`  | `TranslateLanguage[]`（`{ code, label }`） | 12 种内置语言（`DEFAULT_TRANSLATE_LANGUAGES`）               | 多语言列表                                                     |
| `layout`    | `'grid' \| 'tabs'`                         | `text` / `textarea` / `rich-text` 为 `'tabs'`，其余 `'grid'` | 多语言输入布局                                                 |
| `translate` | `(ctx) => Partial<values> \| Promise`      | —                                                            | 翻译回调；不配置时为模拟翻译（把源文复制到目标语言并给出提示） |

翻译回调的 `ctx`（`TranslateHandlerContext`）包含：`command`（`'polish' \| 'translate'`）、`fieldProp`、`fieldValue`、`sourceLanguage`、`sourceValue`、`targetLanguage`、`targetLanguages`、`before`（合并前的多语言值），以及表单的 `mode`、`values`。

`type: 'group'` 为分组容器，自身没有 `prop`，值仍由 `children` 平铺在表单对象里：

| 名称                                     | 类型                              | 默认值  | 说明                                                                                |
| ---------------------------------------- | --------------------------------- | ------- | ----------------------------------------------------------------------------------- |
| `type`                                   | `'group'`                         | —       | 固定值                                                                              |
| `label`                                  | `string`                          | —       | 分组标签（必填）                                                                    |
| `children`                               | `SchemaFormGroupChild[]`          | —       | 子字段，按声明顺序横向排列，不可再嵌套分组；子项 `label` 可选，仅用于占位与校验文案 |
| `anchor`                                 | `boolean`                         | `false` | 锚点分组：带编号的卡片样式；`DrawerFormPage` 中会生成分区导航                       |
| `description`                            | `string`                          | —       | 锚点分组标题下方的辅助说明                                                          |
| `disabled`                               | `boolean \| (context) => boolean` | `false` | 整组禁用，与子项自身条件取或                                                        |
| `hidden` / `hideOnCreate` / `hideOnEdit` | `boolean \| (context) => boolean` | `false` | 整组显隐                                                                            |
| `newRow`                                 | `boolean`                         | `false` | 是否强制另起一行                                                                    |
| `span`                                   | `number`                          | `24`    | 24 栅格占位                                                                         |
| `tip`                                    | `string`                          | —       | 分组底部提示                                                                        |

## 暴露方法

| 名称              | 说明                                                    |
| ----------------- | ------------------------------------------------------- |
| `validate()`      | 校验并返回 `Promise<boolean>`，失败时滚动到首个错误字段 |
| `clearValidate()` | 清除校验状态                                            |
| `resetFields()`   | 重置字段                                                |
| `getValues()`     | 获取当前可见字段值，自动排除隐藏字段                    |

## 富文本自定义工具

`rich-text` 字段的 `props.richTextTools` 具有完整类型推导。除编辑器上下文外，工具还会收到当前字段、表单模式和整张表单的数据；该能力同样适用于 `CrudPage` 的表单字段。

<ClientOnly>
  <DemoBlock :source="richTextSource">
    <RichText />
    <template #description>
      点击「插入商品名」按钮，工具通过 getFormData() 读取表单最新值并写入编辑器。
    </template>
  </DemoBlock>
</ClientOnly>

Schema 场景额外提供以下上下文：

| 名称          | 类型                         | 说明                     |
| ------------- | ---------------------------- | ------------------------ |
| `field`       | `ResolvedField`              | 当前字段元数据           |
| `formData`    | `Record<string, any>`        | 本次渲染时的整张表单值   |
| `getFormData` | `() => Record<string, any>`  | 获取最新的整张表单值     |
| `mode`        | `'create'\| 'edit'\| 'view'` | 当前表单模式             |
| `language`    | `string\| undefined`         | 多语言富文本当前语言代码 |

若工具需要打开弹窗或执行异步任务，请在真正提交时调用 `getFormData()`，避免使用已经过期的 `formData` 快照。

工具项本身的字段（`key`、`label`、`icon`、`order`、`visible`、`disabled`、`onClick` / `component`）与编辑器上下文见 [RichTextEditor 自定义工具栏工具](/components/rich-text-editor#自定义工具栏工具)。
