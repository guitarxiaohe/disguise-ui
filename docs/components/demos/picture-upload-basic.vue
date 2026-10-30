<script setup lang="ts">
import { ref } from 'vue';

import { PictureUpload } from 'disguise-ui';

const single = ref('');
const multiple = ref<string[]>([]);
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap">
    <div>
      <p style="margin: 0 0 8px; font-size: 13px; color: var(--el-text-color-secondary)">单图</p>
      <PictureUpload v-model="single" />
    </div>
    <div>
      <p style="margin: 0 0 8px; font-size: 13px; color: var(--el-text-color-secondary)">多图，最多 3 张</p>
      <PictureUpload v-model="multiple" :max-count="3" />
    </div>
  </div>
</template>
