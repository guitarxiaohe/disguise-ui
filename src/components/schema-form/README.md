# SchemaForm 元数据表单

用一份纯数据的 schema 描述表单，组件负责渲染控件、生成校验规则、处理只读态与字段联动。

schema 里只放数据、不放函数，所以它可以被序列化、存库或由后端下发。需要取数的字段（如 `async-select`）通过 `entityKey` 到 `src/entities` 注册表里查取数函数。

## 基础用法

```vue
<script setup lang="ts">
import type { SchemaFormItem } from '@/components/schema-form';

import { ref } from 'vue';

import { SchemaForm } from '@/components';

const values = ref<Record<string, any>>({});
const formRef = ref<InstanceType<typeof SchemaForm>>();

const schema: SchemaFormItem[] = [
  { prop: 'name', label: '名称', type: 'text', required: true },
  {
    prop: 'status',
    label: '状态',
    type: 'radio',
    defaultValue: '0',
    options: [
      { label: '正常', value: '0' },
      { label: '停用', value: '1' },
    ],
  },
];

async function submit() {
  const form = formRef.value;
  if (!form || !(await form.validate())) return;
  console.log(form.getValues());
}
</script>

<template>
  <SchemaForm ref="formRef" v-model="values" :schema="schema" />
</template>
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `Record<string, any>` | `{}` | 表单值，用 `v-model` 绑定 |
| `schema` | `SchemaFormItem[]` | `[]` | 字段元数据 |
| `mode` | `'create' \| 'edit' \| 'view'` | `'create'` | 表单模式，影响字段显隐与只读 |
| `columns` | `number` | `1` | 整体栅格列数，字段可用 `span` 单独覆盖 |
| `labelWidth` | `number \| string` | `'auto'` | 标签宽度 |
| `labelPosition` | `'left' \| 'right' \| 'top'` | `'top'` | 标签相对控件的位置（左/右/上） |
| `labelAlign` | `'left' \| 'center' \| 'right'` | — | 标签文字在 `labelWidth` 内的对齐；不设则沿用 Element Plus 默认 |
| `labelGap` | `number \| string` | `20` | 标签与控件间距（px 或带单位字符串） |
| `itemGap` | `number \| string` | `30` | 表单项纵向间距，对应 `--el-form-item-margin-bottom` |
| `groupGap` | `number \| string` | `0` | 分组相对其他表单项额外增加的上下间距（px 或带单位字符串） |
| `disabled` | `boolean` | `false` | 整体禁用 |
| `loading` | `boolean` | `false` | 显示加载遮罩 |
| `underline` | `boolean` | `false` | 为 `true` 时输入框只显示下边框；不传则使用全边框 |

## 暴露方法

```ts
const formRef = ref<InstanceType<typeof SchemaForm>>();

await formRef.value?.validate(); // 校验，返回 boolean，不抛异常
formRef.value?.getValues(); // 取提交值，已剔除当前隐藏的字段
formRef.value?.resetFields(); // 重置
formRef.value?.clearValidate(); // 清除校验状态
```

`getValues()` 只返回当前可见字段。例如 `deptId` 配了 `hideOnCreate`，新建时它不会出现在提交体里。

## 字段通用配置

所有 `type` 都支持以下属性：

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `prop` | `string` | 字段名，对应表单值的 key，同时作为插槽名 |
| `label` | `string` | 标签文字 |
| `type` | `FieldType` | 控件类型，见下节 |
| `placeholder` | `string` | 占位符，不传时按类型自动生成 |
| `defaultValue` | `any` | 默认值，仅在字段 key 不存在时填充 |
| `required` | `boolean` | 自动生成必填规则，与 `rules` 合并 |
| `rules` | `FormItemRule[]` | Element Plus 校验规则 |
| `span` | `number` | 24 栅格占位，不传则按 `columns` 均分 |
| `newRow` | `boolean` | 强制另起一行（可与 `span: 6` 等组合，不必占满 24） |
| `readonly` | `boolean` | 渲染为纯文本而非输入控件 |
| `copyable` | `boolean` | 只读态是否显示复制按钮，默认跟随 `readonly` |
| `disabled` | `boolean \| (ctx) => boolean` | 禁用，支持联动 |
| `hidden` | `boolean \| (ctx) => boolean` | 隐藏，支持联动 |
| `hideOnCreate` | `boolean` | 新建时隐藏 |
| `hideOnEdit` | `boolean` | 编辑时隐藏 |
| `tip` | `string` | 控件下方的灰色提示 |
| `props` | `Record<string, any>` | 透传给底层控件的额外属性 |
| `component` | `string \| Component` | 使用注册的自定义组件，或直接传入 Vue 组件；可覆盖内置控件 |

`placeholder` 和必填提示会按控件类型自动区分措辞：输入类用 `validation.enterField`（"请输入 xxx"），选择类用 `validation.selectField`（"请选择 xxx"）。

## 控件类型

| type           | 渲染              | 说明                              |
| -------------- | ----------------- | --------------------------------- |
| `text`         | `ElInput`         | 带 clearable                      |
| `textarea`     | `ElInput`         | 多行，默认 4 行                   |
| `number`       | `ElInputNumber`   |                                   |
| `select`       | `ElSelect`        | 需要 `options` 或 `dictCode`      |
| `radio`        | `ElRadioGroup`    | 同上                              |
| `checkbox`     | `ElCheckboxGroup` | 同上，值为数组                    |
| `switch`       | `ElSwitch`        |                                   |
| `date`         | `ElDatePicker`    | 值格式 `YYYY-MM-DD`               |
| `datetime`     | `ElDatePicker`    | 值格式 `YYYY-MM-DD HH:mm:ss`      |
| `picture`      | `PictureUpload`   | 图片上传，配置走 `props` 透传     |
| `file`         | `FileUpload`      | 附件上传，配置走 `props` 透传     |
| `upload`       | `FileUpload`      | 通用上传兼容类型，配置走 `props` 透传 |
| `async-select` | `AsyncSelect`     | 需要 `apiOptions`                 |
| `component`    | 注册的自定义组件  | 默认使用 `v-model:modelValue`     |
| `slot`         | 自定义            | 插槽名为 `prop`                   |
| `group`        | 容器              | 一个 label 下并排多个控件，见下节 |

未内置的类型有：富文本、级联选择、日期区间、纯时间、密码框。这些暂时用 `slot` 接。

## 自定义组件

通过 `registerSchemaFormComponents` 注册组件后，字段可以用 `component` 指定组件。组件默认使用 `v-model:modelValue`，也可以配置自定义的值属性和更新事件。

```vue
<script setup lang="ts">
import { registerSchemaFormComponents } from '@/components';
import UserPicker from './user-picker.vue';

registerSchemaFormComponents({
  UserPicker,
  CheckControl: {
    component: CheckControl,
    modelProp: 'checked',
    updateEvent: 'update:checked',
  },
});
</script>
```

```ts
const schema: SchemaFormItem[] = [
  {
    prop: 'userId',
    label: '用户',
    type: 'component',
    component: 'UserPicker',
    props: { clearable: true },
  },
  {
    prop: 'enabled',
    label: '启用',
    type: 'component',
    component: 'CheckControl',
  },
];
```

宿主应用已注册的通用表单组件也可以直接使用，例如：

```ts
{
  prop: 'name',
  label: '名称',
  type: 'component',
  component: 'Input',
}
```

如果自定义组件的事件名不是 `update:modelValue`，可以在字段上配置完整的双向绑定协议：

```ts
{
  prop: 'icon',
  label: '菜单图标',
  type: 'component',
  component: {
    component: IconSelect,
    modelProp: 'modelValue',
    updateEvent: 'selected',
    valueExtractor: (iconItem: IconItem) => iconItem.icon,
  },
}
```

其中 `modelProp` 负责把表单值传给组件，`updateEvent` 负责接收组件事件，`valueExtractor` 用于把事件参数转换成最终表单值。若组件使用标准 `v-model:modelValue`，只需直接写 `component: IconSelect`。

自定义事件可以通过 `props` 函数拿到当前字段的 `updateValue`，把事件参数转换成字段值：

```ts
{
  prop: 'icon',
  label: '菜单图标',
  type: 'component',
  component: IconSelect,
  props: ({ updateValue }) => ({
    onSelected: (iconItem: IconItem) => {
      updateValue(iconItem.icon);
    },
  }),
}
```

如果事件返回的就是字段值，也可以直接写成 `onSelected: updateValue`。

也可以用 `component` 覆盖某个内置类型的默认控件：

```ts
{
  prop: 'name',
  label: '名称',
  type: 'text',
  component: 'Input',
}
```

## 选项来源

`select`、`radio`、`checkbox` 三种控件的选项有三个来源，用 `optionSource` 区分。

**静态选项**，不写 `optionSource` 或写 `'static'`：

```ts
{
  prop: 'status',
  label: '状态',
  type: 'radio',
  options: [
    { label: '正常', value: '0' },
    { label: '停用', value: '1' },
  ],
}
```

**字典选项**，走项目全量字典缓存，不用自己拉接口：

```ts
{
  prop: 'sex',
  label: '性别',
  type: 'select',
  optionSource: 'dict',
  dictCode: 'sys_user_sex',
}
```

**接口选项**，用 `async-select`，带分页下拉和弹窗选择：

```ts
{
  prop: 'parentId',
  label: '上级部门',
  type: 'async-select',
  apiOptions: {
    entityKey: 'dept',
    valueKey: 'deptId',
    labelKey: 'deptName',
    subtitleKey: 'leader',
  },
}
```

`apiOptions` 里除 `entityKey` 外都是可选的，不写就用实体注册表里的默认值。另外支持 `multiple` 开启多选、`params` 附加固定查询条件。

独立使用 `AsyncSelect` 时，也可以直接传 `dictCode` 读取相同的字典缓存：

```vue
<AsyncSelect v-model:model-value="status" dict-code="sys_status" />
```

传入 `dictCode` 后，字典选项用于本地下拉和弹窗列表；如同时配置 `fetcher`，仍以远程数据为准。

## 对接 entities

`entityKey` 到取数函数的映射在 `src/entities`。新增一个实体三步：

1. 在 `src/entities/` 下建文件，导出一个返回 `EntityDefinition` 的工厂函数
2. 在 `src/entities/index.ts` 的 `setupEntities()` 里注册
3. schema 里写 `apiOptions.entityKey`

```ts
// src/entities/role.ts
export function createRoleEntity(): EntityDefinition {
  return {
    key: 'role',
    valueKey: 'roleId',
    labelKey: 'roleName',
    columns: [{ key: 'roleName', dataKey: 'roleName', title: '角色名称' }],
    fetch: async (params) => {
      const rows = await fetchRoleList(params.params);
      return paginateLocally(rows, params, ['roleName']);
    },
  };
}
```

导出工厂函数而不是常量，是因为列标题用了 `$t()`，需要等 i18n 初始化后再求值。`setupEntities()` 在 `bootstrap.ts` 里 `setupI18n(app)` 之后调用。

接口本身分页时直接在 `fetch` 里透传 `page` / `pageSize`；接口一次性返回全量时用 `paginateLocally` 在前端切片和过滤。

## 只读与详情态

字段级 `readonly: true` 或整个表单 `mode="view"` 都会进入只读态，渲染成纯文本加复制按钮，空值显示"暂无"。做详情页只要传 `mode="view"`，schema 完全不用改。

```vue
<SchemaForm v-model="values" :schema="schema" mode="view" />
```

`copyable` 默认跟随 `readonly`：字段自己声明 `readonly: true` 时默认带复制按钮，整表 `mode="view"` 时默认不带。显式写 `copyable` 可覆盖。

查看态的 `picture`、`file` 和 `upload` 字段复用表格的图片/附件单元格展示，可预览图片、查看或下载附件；字典字段显示字典标签。其他字段显示为只读文本。

## 字段联动

`hidden` 和 `disabled` 都可以传函数，参数里有当前模式和全量表单值：

```ts
{
  prop: 'reason',
  label: '停用原因',
  type: 'textarea',
  hidden: ({ values }) => values.status !== '1',
}
```

`hideOnCreate` 和 `hideOnEdit` 是常用场景的语法糖，等价于判断 `ctx.mode`。

被隐藏的字段不会渲染，也不会出现在 `getValues()` 的结果里。

## 插槽

`type: 'slot'` 的字段会把渲染交给外部，插槽名就是字段的 `prop`，同时保留 `ElFormItem` 的标签和校验：

```vue
<SchemaForm v-model="values" :schema="schema">
  <template #avatar="{ value, disabled, updateValue }">
    <MyPicker
      :model-value="value"
      :disabled="disabled"
      @update:model-value="updateValue"
    />
  </template>
</SchemaForm>
```

作用域参数为 `{ field, value, disabled, updateValue }`。

注意只读态优先于类型分发，`readonly` 或 `mode="view"` 时插槽不会渲染，会退回纯文本。需要自定义只读展示的字段，得内置成一个 `type`。

## 组合控件

一个 label 下并排多个控件（售卖方式 + 单位、重量 + 单位）。容器没有 `prop`，值仍由 `children` 平铺在表单对象里，它只负责标签和横向布局。

```ts
{
  type: 'group',
  label: '售卖单位',
  children: [
    {
      prop: 'saleType',
      type: 'select',
      defaultValue: 'piece',
      placeholder: '请选择售卖方式',
      options: [
        { label: '按件卖', value: 'piece' },
        { label: '按批卖', value: 'batch' },
      ],
    },
    {
      prop: 'unitCode',
      type: 'select',
      placeholder: '请选择单位',
      options: [
        { label: 'Piece', value: 'piece' },
        { label: 'Pack', value: 'pack' },
      ],
    },
  ],
}
```

- 不能再嵌套 `group`
- 子项 `label` 不展示，只用于占位符和校验文案；不写则回退到 `prop`
- 子项 `span` 是组内 flex 权重，不写则等分（`12` + `12` 与不写效果相同）
- 组级 `hidden` / `disabled` 作用于整组，与子项自己的条件取或
- 必填星号打在组的 label 上；校验仍按子项 `prop` 分别报错
- `getValues()` 收集的是可见子项，不是整个 group

## 扩展新的控件类型

改两个地方：

1. `schema-form.type.ts` 的 `FieldType` 和 `SchemaFormItem` 联合类型各加一支
2. `schema-form-item.vue` 的模板加一个 `v-else-if` 分支

校验、只读、联动、栅格都是通用逻辑，不用动。如果新控件是选择类，记得把 type 加进 `schema-form.util.ts` 的 `CHOICE_TYPES`，否则提示语会用"请输入"而不是"请选择"。

依赖较重的控件（如富文本）用 `defineAsyncComponent` 懒加载，避免拖累所有表单页面的首屏体积。

等 `schema-form-item.vue` 超过约 350 行时，应该把控件拆到 `widgets/` 目录并改用组件映射表，不要继续堆 `v-else-if`。

## 尚未支持的能力

以下能力都还没实现，但已经过一轮设计讨论，有结论。撞上这些需求时请按下述方向做，不要另起炉灶。

分组可通过 `anchor: true` 标记为抽屉表单的锚点分区。`DrawerFormPage` 会在固定 header 中生成分区导航，点击后平滑滚动到对应分组；独立使用 `SchemaForm` 时只渲染分区，不显示导航。`CrudPage` 通过内置的 `DrawerFormPage` 显示相同导航。

**多语言字段**。同一字段有多种语言的值，UI 是语言页签加输入区。**做成正交修饰符 `i18n: true`，不要做成 `i18n-text` 这类新类型**，否则 `text`、`textarea`、富文本都要各配一个多语言版本，类型表会不断膨胀。开启后值从 `string` 变为 `{ 'en-US': ..., 'zh-CN': ... }`，外层负责语言切换与读写，内层控件无感知。必填语义需另行明确：是所有语言都必填，还是默认语言有值即通过。自动翻译属于附加能力，翻译函数应像 `entities` 那样注册，不写进 schema。

**动态行列表**。值为数组、行可增删、每行是一组字段（如阶梯价格、属性表）。本质是递归的迷你表单，实现时注意校验的 prop 路径需为 `list.0.price` 形式，否则无法定位到具体单元格。

**富文本**。项目已有 `@vben/plugins/tiptap`（含配套的 `VbenTiptapPreview` 用于只读态），无需新增依赖。落地前必须先确定图片上传接口，否则插入的图片会使用 blob 地址，存库后刷新即失效。引入时用 `defineAsyncComponent` 懒加载。

## 已知限制

- `async-select` 字段在只读态下显示的是原始值（如部门 id）而不是名称，做详情页时需注意
- `dict` 来源依赖 `useAllDictDataQuery`，字典数据缓存 30 分钟
