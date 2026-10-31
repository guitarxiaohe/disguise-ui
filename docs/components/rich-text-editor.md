# RichTextEditor 富文本

基于 Tiptap 的编辑器，支持标题、对齐、颜色、表格和图片。

<script setup>
import Basic from './demos/rich-text-editor-basic.vue'
import source from './demos/rich-text-editor-basic.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

插入图片时同样走注入的 `uploadFile`。建议在落地前先接好上传接口，避免 blob 地址存库后失效。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | HTML 内容 |
| `editable` | `boolean` | `true` | 是否可编辑 |
| `placeholder` | `string` | — | 占位文案 |
| `maxHeight` | `string` | `'400px'` | 编辑区最大高度 |
| `richTextTools` | `RichTextTool[]` | `[]` | 追加到内置工具栏末尾的自定义工具 |
| `toolContext` | `object` | `{}` | 为工具补充业务上下文；通常由 `SchemaForm` 自动注入 |

## 自定义工具栏工具

`richTextTools` 支持按钮工具和自定义组件工具。按钮工具使用 `onClick`，自定义组件工具使用 `component`，两者不能同时配置。`key` 是必填的唯一标识，`order` 只控制自定义工具之间的顺序。

~~~ts
import type { RichTextTool } from 'disguise-ui'
import { PackagePlus } from 'lucide-vue-next'

const richTextTools: RichTextTool[] = [
  {
    key: 'insert-product',
    label: '插入商品',
    icon: PackagePlus,
    order: 100,
    visible: ({ editable }) => editable,
    onClick: ({ editor }) => {
      editor.chain().focus().insertContent('<p>商品信息</p>').run()
    },
  },
]
~~~

工具上下文包含：

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `editor` | `Editor` | 当前 Tiptap 编辑器实例 |
| `value` | `string` | 调用工具时的 HTML |
| `editable` | `boolean` | 当前是否可编辑 |
| `getValue` | `() => string` | 获取最新 HTML，适合异步操作完成后调用 |
| `updateValue` | `(value: string) => void` | 更新 HTML 并同步 `v-model` |

自定义组件会收到 `context` 和 `disabled` 两个属性，也可以通过工具项的 `props` 传入额外属性。
