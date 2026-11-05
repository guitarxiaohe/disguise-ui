<script setup lang="ts">
import { PackagePlus } from 'lucide-vue-next';
import { ref } from 'vue';

import { SchemaForm } from 'disguise-ui';
import type { SchemaFormItem } from 'disguise-ui';

const values = ref<Record<string, any>>({ productName: '春季新款' });

const schema: SchemaFormItem[] = [
  { prop: 'productName', label: '商品名称', type: 'text', span: 12 },
  {
    prop: 'content',
    label: '商品详情',
    type: 'rich-text',
    span: 24,
    props: {
      maxHeight: '260px',
      richTextTools: [
        {
          key: 'insert-product',
          label: '插入商品名',
          icon: PackagePlus,
          visible: ({ mode }) => mode !== 'view',
          onClick: ({ editor, getFormData }) => {
            const name = getFormData().productName ?? '未填写商品名称';
            editor
              .chain()
              .focus()
              .insertContent('<p>' + name + '</p>')
              .run();
          },
        },
      ],
    },
  },
];
</script>

<template>
  <SchemaForm v-model="values" :schema="schema" />
</template>
