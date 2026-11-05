<script setup lang="ts">
import { ref } from 'vue';

import { FileUpload } from 'disguise-ui';

const single = ref('');
const multiple = ref<any[]>([]);
</script>

<template>
  <div
    style="display: flex; gap: 32px; align-items: flex-start; flex-wrap: wrap"
  >
    <div>
      <p style="margin: 0 0 8px; color: var(--el-text-color-secondary)">
        单文件
      </p>
      <FileUpload v-model="single" :max-size="20" />
    </div>
    <div>
      <p style="margin: 0 0 8px; color: var(--el-text-color-secondary)">
        多文件，最多 3 个
      </p>
      <FileUpload v-model="multiple" :max-count="3" :max-size="20" />
    </div>
  </div>
</template>
