<script setup lang="ts">
import { PackagePlus } from 'lucide-vue-next';
import { ref } from 'vue';

import { RichTextEditor } from 'disguise-ui';
import type { RichTextTool } from 'disguise-ui';

const html = ref('<p>点击工具栏末尾的自定义按钮试试。</p>');

const richTextTools: RichTextTool[] = [
  {
    key: 'insert-date',
    label: '插入日期',
    icon: PackagePlus,
    order: 100,
    visible: ({ editable }) => editable,
    onClick: ({ editor }) => {
      const date = new Date().toLocaleDateString('zh-CN');
      editor
        .chain()
        .focus()
        .insertContent('<p>' + date + '</p>')
        .run();
    },
  },
];
</script>

<template>
  <RichTextEditor v-model="html" :rich-text-tools="richTextTools" />
</template>
