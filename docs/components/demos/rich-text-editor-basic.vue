<script setup lang="ts">
import { ref } from 'vue';

import { RichTextEditor } from 'disguise-ui';

const html = ref('<p>在这里编辑商品详情或公告内容。</p>');
</script>

<template>
  <RichTextEditor v-model="html" />
</template>
