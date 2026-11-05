# RichTextEditor 富文本

基于 Tiptap 的编辑器，支持标题、对齐、颜色、表格和图片。

<script setup>
import Basic from './demos/rich-text-editor-basic.vue'
import source from './demos/rich-text-editor-basic.vue?raw'
import Tools from './demos/rich-text-editor-tools.vue'
import toolsSource from './demos/rich-text-editor-tools.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

插入图片通过弹窗输入图片地址，组件本身不会上传文件。建议在业务侧先接好上传接口，拿到 URL 后再写入编辑器，避免 blob 地址存库后失效。

## Props

| 名称            | 类型             | 默认值                     | 说明                                               |
| --------------- | ---------------- | -------------------------- | -------------------------------------------------- |
| `modelValue`    | `string`         | `''`                       | HTML 内容                                          |
| `editable`      | `boolean`        | `true`                     | 是否可编辑                                         |
| `placeholder`   | `string`         | `''`（为空时使用内置文案） | 占位文案                                           |
| `maxHeight`     | `string`         | `'400px'`                  | 编辑区最大高度                                     |
| `richTextTools` | `RichTextTool[]` | `[]`                       | 追加到内置工具栏末尾的自定义工具                   |
| `toolContext`   | `object`         | `{}`                       | 为工具补充业务上下文；通常由 `SchemaForm` 自动注入 |

## Events

| 名称                | 参数           | 说明                                      |
| ------------------- | -------------- | ----------------------------------------- |
| `update:modelValue` | `html: string` | 编辑器内容变化；使用 `v-model` 时自动绑定 |

## Slots

| 名称             | 插槽参数 | 说明                                                   |
| ---------------- | -------- | ------------------------------------------------------ |
| `toolbar-append` | —        | 在内置工具栏末尾、`richTextTools` 之前插入任意工具内容 |

## 暴露方法

| 名称            | 说明                          |
| --------------- | ----------------------------- |
| `editor`        | 当前 Tiptap `Editor` 实例引用 |
| `clearFormat()` | 清除当前选区的格式            |

## 自定义工具栏工具

`richTextTools` 支持按钮工具和自定义组件工具。按钮工具使用 `onClick`，自定义组件工具使用 `component`，两者不能同时配置。`key` 是必填的唯一标识，`label` 是按钮提示（未提供 `icon` 时兼作按钮文字），`order` 只控制自定义工具之间的顺序（默认 `0`，数值越小越靠前）。`visible` 与 `disabled` 可以传布尔或 `(ctx) => boolean`；编辑器不可编辑时按钮工具始终禁用。

<ClientOnly>
  <DemoBlock :source="toolsSource">
    <Tools />
    <template #description>
      工具追加在内置工具栏末尾，visible 为 false 时整个按钮不渲染。
    </template>
  </DemoBlock>
</ClientOnly>

工具上下文包含：

| 名称          | 类型                      | 说明                                  |
| ------------- | ------------------------- | ------------------------------------- |
| `editor`      | `Editor`                  | 当前 Tiptap 编辑器实例                |
| `value`       | `string`                  | 调用工具时的 HTML                     |
| `editable`    | `boolean`                 | 当前是否可编辑                        |
| `getValue`    | `() => string`            | 获取最新 HTML，适合异步操作完成后调用 |
| `updateValue` | `(value: string) => void` | 更新 HTML 并同步 `v-model`            |

自定义组件会收到 `context` 和 `disabled` 两个属性，也可以通过工具项的 `props` 传入额外属性。
