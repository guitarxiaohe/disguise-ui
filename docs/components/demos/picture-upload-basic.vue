<script setup lang="ts">
import { ref } from 'vue';

import { PictureUpload } from 'disguise-ui';

const single = ref('');
const multiple = ref<string[]>([]);
const cropped = ref('');
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

    <div>
      <p style="margin: 0 0 8px; font-size: 13px; color: var(--el-text-color-secondary)">
        裁剪，可选择比例
      </p>
      <PictureUpload
        v-model="cropped"
        :crop="{
          enabled: true,
          aspectRatio: 16 / 9,
          aspectRatios: [
            { label: '自由', value: null },
            { label: '1:1', value: 1 },
            { label: '4:3', value: 4 / 3 },
            { label: '16:9', value: 16 / 9 },
          ],
          quality: 0.9,
        }"
        :dimensions="{
          minWidth: 800,
          minHeight: 450,
          maxWidth: 2400,
          maxHeight: 2400,
        }"
      />
    </div>
  </div>
</template>
