<script setup lang="ts">
import { ref } from 'vue';

import { PictureUpload } from 'disguise-ui';

const cover = ref('');
const detail = ref('');
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap">
    <div>
      <p
        style="
          margin: 0 0 8px;
          font-size: 13px;
          color: var(--el-text-color-secondary);
        "
      >
        固定输出 1600 × 900，裁剪框锁定 16:9
      </p>
      <PictureUpload
        v-model="cover"
        :crop="{ enabled: true, aspectRatio: 16 / 9 }"
        :dimensions="{ width: 1600, height: 900 }"
      />
    </div>

    <div>
      <p
        style="
          margin: 0 0 8px;
          font-size: 13px;
          color: var(--el-text-color-secondary);
        "
      >
        只限制尺寸范围，可自由调整裁剪框
      </p>
      <PictureUpload
        v-model="detail"
        :crop="{ enabled: true }"
        :dimensions="{
          minWidth: 800,
          minHeight: 600,
          maxWidth: 2400,
          maxHeight: 1800,
        }"
      />
    </div>
  </div>
</template>
