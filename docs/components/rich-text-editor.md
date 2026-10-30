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
