<script setup lang="ts">
import { computed } from 'vue';

import { Loading, Picture } from '@element-plus/icons-vue';
import { ElEmpty, ElIcon, ElImage, ElTooltip } from 'element-plus';

defineOptions({
  name: 'ImagePreview',
});

const props = withDefaults(defineProps<ImageListProps>(), {
  images: () => [],
  size: 80,
  maxStack: 3,
  offset: 6,
});

export interface ImageListProps {
  /** 图片地址数组 */
  images?: string[];
  /** 单张缩略图尺寸（像素） */
  size?: number;
  /** 最多叠放多少层 */
  maxStack?: number;
  /** 每层偏移距离（像素） */
  offset?: number;
}

/** 实际参与叠放的图片（倒序，让第一张渲染在最上层） */
const displayImages = computed(() => {
  const stack = props.images.slice(0, props.maxStack);
  return [...stack].reverse();
});

/** 容器尺寸 */
const stackContainerStyle = computed(() => {
  const layers = Math.min(props.images.length, props.maxStack);
  const extra = (layers - 1) * props.offset;
  return {
    width: `${props.size + extra}px`,
    height: `${props.size + extra}px`,
  };
});

/** 每一层的定位与层级 */
const stackItemStyle = (index: number) => {
  const layers = Math.min(props.images.length, props.maxStack);
  const isTop = index === layers - 1;
  const shift = index * props.offset;

  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
    left: `${shift}px`,
    top: `${shift}px`,
    zIndex: index + 1,
    boxShadow: isTop ? 'none' : '0 1px 4px rgba(0,0,0,0.08)',
  };
};
</script>

<template>
  <div class="inline-block">
    <div v-if="images.length" class="relative" :style="stackContainerStyle">
      <!-- 叠放的多张图（从后往前渲染，保证第一张在最上层） -->
      <ElTooltip
        v-for="(img, index) in displayImages"
        :key="index"
        placement="top"
        effect="light"
        :show-after="100"
        :teleported="true"
        :z-index="9000"
      >
        <template #content>
          <img
            :src="img"
            style="display: block; max-width: 300px; max-height: 300px"
          />
        </template>

        <div
          class="group absolute overflow-hidden rounded-md border border-gray-200 bg-gray-50 cursor-pointer transition-all duration-200 hover:-translate-y-px hover:border-blue-500"
          :style="stackItemStyle(index)"
        >
          <!-- 点击触发全屏预览，可左右切换 -->
          <ElImage
            :src="img"
            fit="cover"
            class="block h-full w-full"
            :preview-src-list="images"
            :initial-index="displayImages.length - 1 - index"
            :preview-teleported="true"
            :hide-on-click-modal="true"
            :z-index="3000"
          >
            <template #placeholder>
              <div
                class="flex h-full w-full items-center justify-center text-gray-400"
              >
                <ElIcon class="is-loading text-xl"><Loading /></ElIcon>
              </div>
            </template>
            <template #error>
              <div
                class="flex h-full w-full items-center justify-center text-gray-400"
              >
                <ElIcon class="text-xl"><Picture /></ElIcon>
              </div>
            </template>
          </ElImage>

          <!-- 最上层图片显示数量角标 -->
          <span
            v-if="
              index === displayImages.length - 1 &&
              images.length > 1 &&
              props.size >= 80
            "
            :style="{
              width: props.size < 40 ? `${props.size / 1.5}px` : '40px',
              height: props.size < 25 ? `${props.size / 1.5}px` : '25px',
              fontSize: props.size / 4,
            }"
            class="pointer-events-none absolute right-1 bottom-1 inline-flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-px text-xs leading-tight text-white"
          >
            <ElIcon :size="props.size / 4"><Picture /></ElIcon>
            {{ images.length }}
          </span>
        </div>
      </ElTooltip>
    </div>

    <ElEmpty v-else description="暂无图片" :image-size="40" />
  </div>
</template>
