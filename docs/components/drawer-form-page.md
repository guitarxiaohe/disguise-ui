# DrawerFormPage 抽屉表单

把 `SchemaForm` 放进抽屉，用于新增、编辑和查看。推荐通过 `useDrawerFormPage` 打开。

抽屉里可以放下所有表单控件：输入、选择、上传、富文本、多语言翻译、插槽和自定义组件。顶部全屏、分区锚点和底部操作栏都是抽屉自己的能力。

<script setup>
import Basic from './demos/drawer-form-page-basic.vue'
import basicSource from './demos/drawer-form-page-basic.vue?raw'
import Full from './demos/drawer-form-page-full.vue'
import fullSource from './demos/drawer-form-page-full.vue?raw'
import Modes from './demos/drawer-form-page-modes.vue'
import modesSource from './demos/drawer-form-page-modes.vue?raw'
import Linkage from './demos/drawer-form-page-linkage.vue'
import linkageSource from './demos/drawer-form-page-linkage.vue?raw'
</script>

## 基础用法

`useDrawerFormPage` 返回 `[Drawer, api]`。把 `Drawer` 放进模板，用 `api.open()` / `api.close()` 控制。

<ClientOnly>
  <DemoBlock :source="basicSource">
    <Basic />
  </DemoBlock>
</ClientOnly>

## 全量控件

一份 schema 覆盖当前所有字段类型，并带上分组锚点、组合控件、字段显隐、上传、富文本翻译、评分插槽、主题色自定义组件，以及自定义底部按钮。

<ClientOnly>
  <DemoBlock :source="fullSource">
    <Full />
    <template #description>
      打开后可点顶部锚点跳转分区，也可点全屏。详情里的翻译会把源文复制到目标语言并加上标记，接入真实接口时替换 `translateConfig.translate` 即可。
    </template>
  </DemoBlock>
</ClientOnly>

完整字段定义在 `docs/components/demos/drawer-form-schema.ts`。

| 分区 | 用到的能力 |
| --- | --- |
| 基本信息 | `text`、`number`、`switch`、字典 `radio` / `select`、`async-select`、`hideOnCreate` |
| 售卖单位 | 非锚点 `group`，一个 label 下并排两个 `select` |
| 展示与选项 | `checkbox`、`date`、`datetime`、注册的 `component`（颜色）、`slot`（评分） |
| 链接与联动 | `hidden` / `required` / `disabled` 随类型变化 |
| 媒体与附件 | `picture` 单图和多图、`file`、`upload` |
| 详情 | `textarea`、`rich-text` + `translateConfig` |

## 新增、编辑与查看

同一份 schema，打开时传入不同 `mode`。查看模式自动只读，提交按钮隐藏，列数固定为两列。

<ClientOnly>
  <DemoBlock :source="modesSource">
    <Modes />
    <template #description>
      新增时「编号」被 `hideOnCreate` 藏掉；编辑和查看时它只读出现。
    </template>
  </DemoBlock>
</ClientOnly>

```ts
api.open({ mode: 'create', title: '新增商品', values: {} });
api.open({ mode: 'edit', title: '编辑商品', values: row });
api.open({ mode: 'view', title: '商品详情', values: row });
```

## 字段联动

`hidden`、`disabled`、`required`、`options`、`props` 都可以是函数，读取当前 `mode` 和全量表单值。

<ClientOnly>
  <DemoBlock :source="linkageSource">
    <Linkage />
  </DemoBlock>
</ClientOnly>

## 控件类型

| type | 渲染 | 说明 |
| --- | --- | --- |
| `text` | `ElInput` | 带 clearable |
| `textarea` | `ElInput` | 多行 |
| `number` | `ElInputNumber` | 数字 |
| `select` | `AsyncSelect` | 静态 `options` 或 `dictCode` |
| `radio` | `ElRadioGroup` | 同上 |
| `checkbox` | `ElCheckboxGroup` | 值为数组 |
| `switch` | `ElSwitch` | 开关 |
| `date` / `datetime` | `ElDatePicker` | `YYYY-MM-DD` / 带时分秒 |
| `picture` | `PictureUpload` | 单图或多图，配置走 `props` |
| `file` / `upload` | `FileUpload` | 附件 |
| `async-select` | `AsyncSelect` | `apiOptions.entityKey` 对应 `registerEntity` |
| `rich-text` | `RichTextEditor` | 可叠加 `translateConfig` |
| `slot` | 自定义 | 插槽名等于 `prop` |
| `component` | 注册组件 | 先 `registerSchemaFormComponents` |
| `group` | 容器 | `anchor: true` 时成为抽屉分区 |

## 抽屉自身能力

| 能力 | 怎么用 |
| --- | --- |
| 打开 / 关闭 | `api.open(options)`、`api.close()` |
| 全屏 | 默认显示按钮，或 `api.toggleFullscreen()` |
| 分区导航 | 分组设置 `anchor: true` |
| 校验 / 取值 | `api.validate()`、`api.getValues()`、`api.setValues()` |
| 自定义底部 | `#footer="{ cancel, submit, submitting }"` |
| 自定义字段 | `#字段prop`，参数为 `{ field, value, disabled, updateValue }` |
| 提交中锁操作 | `submitting: true` 时禁用关闭和按钮 |

`open` 时传入的 `title`、`mode`、`schema`、`values` 会覆盖 hook 的默认值。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | `''` | 抽屉标题 |
| `mode` | `'create' \| 'edit' \| 'view'` | `'create'` | 表单模式 |
| `schema` | `SchemaFormItem[]` | `[]` | 字段元数据 |
| `formValues` | `Record` | `{}` | 表单值 |
| `size` | `number \| string` | `'560px'` | 非全屏宽度 |
| `direction` | `'rtl' \| 'ltr' \| 'ttb' \| 'btt'` | `'rtl'` | 打开方向 |
| `fullscreenButton` | `boolean` | `true` | 是否显示全屏按钮 |
| `fullscreen` | `boolean` | `false` | 初始是否全屏 |
| `normalColumns` | `number` | 跟随 `schemaFormProps.columns` | 常规列数 |
| `fullscreenColumns` | `number` | 至少 3 列 | 全屏列数 |
| `showFooter` | `boolean` | `true` | 底部操作栏 |
| `showCancelButton` | `boolean` | `true` | 取消按钮 |
| `showSubmitButton` | `boolean` | `true` | 查看模式默认仍会隐藏 |
| `cancelText` / `submitText` | `string` | `'取消'` / `'确定'` | 按钮文案 |
| `statusText` | `string` | 按 mode 生成 | 标题右侧状态 |
| `loading` | `boolean` | `false` | 内容加载 |
| `submitting` | `boolean` | `false` | 提交中 |
| `disabled` | `boolean` | `false` | 整表禁用 |
| `schemaFormProps` | 布局属性 | `{}` | 透传给 SchemaForm |

## 暴露方法

```ts
api.open({ mode: 'edit', title: '编辑', values: row });
api.close();
api.toggleFullscreen();
await api.validate();
api.getValues();
api.setValues({ name: '新名称' });
await api.submit();
```
