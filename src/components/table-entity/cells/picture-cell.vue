<script setup lang="ts">
import type { ImagesViewProps } from '@/components/images-view/index.vue';

import { computed, useAttrs } from 'vue';

import ImagesView from '@/components/images-view/index.vue';

/**
 * 图片类型单元格组件
 *
 * 功能：
 * - 显示图片缩略图
 * - 支持点击预览大图
 */

interface Props {
  /** 图片 URL 列表 */
  urls: string[];
  /** 最多展示的缩略图数量 */
  maxPreviewCount?: number;
  /** ImagesView 的属性，可覆盖透传到图片列表容器 */
  imageListProps?: Partial<Omit<ImagesViewProps, 'images'>>;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
  imageListProps: () => ({}),
  maxPreviewCount: 3,
});
const attrs = useAttrs();

const previewUrls = computed(() => props.urls.filter((url) => url));
// 控制列表密度，保留全部预览能力
const displayUrls = computed(() =>
  previewUrls.value.slice(0, props.maxPreviewCount),
);
const imageListAttrs = computed(() => ({
  ...attrs,
  ...(props.imageListProps ?? {}),
}));
</script>

<template>
  <div class="picture-cell flex">
    <template v-if="displayUrls.length > 0">
      <ImagesView v-bind="imageListAttrs" :images="displayUrls" />
    </template>
    <span v-else>-</span>
  </div>
</template>

<style scoped lang="scss">
.picture-cell {
  height: 100%;
}

.picture-cell__list {
  display: flex;
  gap: 4px;
  align-items: center;
}

.picture-cell__item {
  width: 28px;
  height: 28px;
  cursor: pointer;
  border-radius: 4px;
}

.picture-cell__extra {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 12px;
  color: #606266;
  background-color: #f2f3f5;
  border-radius: 4px;
}
</style>
