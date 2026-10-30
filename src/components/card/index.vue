<script setup lang="ts">
import { computed } from 'vue';

import { preferences } from '@/runtime/preferences';

import { ElCard } from 'element-plus';

defineOptions({
  inheritAttrs: false,
});

const shadow = computed(() => preferences.theme.cardShadow);
</script>

<template>
  <ElCard class="box-card" v-bind="$attrs" :shadow="shadow">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}"></slot>
    </template>
  </ElCard>
</template>
<style scoped lang="scss">
.box-card {
  padding: 0;

  :deep(.el-card__body) {
    padding: 10px 20px;
  }

  :deep(.el-card__header) {
    padding: 15px;
  }
}
</style>
