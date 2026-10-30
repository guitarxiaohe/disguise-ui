<script lang="ts" setup>
import { ElIcon } from 'element-plus';

/**
 * 阿里图标统一封装 以后需要修改样式在此文件修改
 * 属性全部穿透需要调整样式可直接传 :style
 */

const props = withDefaults(
  defineProps<{
    className?: string;
    icon?: string;
  }>(),
  {
    icon: '',
    className: 'disguiseicon',
  },
);
</script>
<template>
  <ElIcon
    v-bind="$attrs"
    class="disguise iconfont"
    :class="props.icon ? `${props.className}-${props.icon}` : undefined"
  />
</template>
