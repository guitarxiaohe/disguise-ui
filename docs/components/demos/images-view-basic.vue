<script setup lang="ts">
import { ImagesView } from 'disguise-ui';

function swatch(color: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="54%" text-anchor="middle" fill="#fff" font-size="42" font-family="sans-serif">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const images = [
  swatch('#409EFF', '1'),
  swatch('#67C23A', '2'),
  swatch('#E6A23C', '3'),
  swatch('#F56C6C', '4'),
];
</script>

<template>
  <div style="display: flex; gap: 48px; align-items: flex-end; flex-wrap: wrap">
    <div>
      <div style="margin-bottom: 8px; color: var(--el-text-color-secondary)">
        默认叠放
      </div>
      <ImagesView :images="images" />
    </div>
    <div>
      <div style="margin-bottom: 8px; color: var(--el-text-color-secondary)">
        缩小并少叠一层
      </div>
      <ImagesView :images="images" :size="48" :max-stack="2" :offset="8" />
    </div>
    <div>
      <div style="margin-bottom: 8px; color: var(--el-text-color-secondary)">
        空状态
      </div>
      <ImagesView />
    </div>
  </div>
</template>
