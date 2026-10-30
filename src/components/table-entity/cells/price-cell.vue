<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    price: string;
    lodPrice: string;
  }>(),
  {
    price: '',
    /**
     * 老价格 带航线
     */
    lodPrice: '',
  },
);

/** 保留两位小数，自动补 $ 前缀 */
const formatPrice = (val: string) => {
  const num = parseFloat(val.replace(/[^0-9.-]/g, ''));
  const fixed = isNaN(num) ? '0.00' : num.toFixed(2);
  return `$${fixed}`;
};
</script>

<template>
  <div class="price-cell">
    <span class="text-[red]">{{ formatPrice(price) }}</span>
    <span v-if="lodPrice" class="ml-1 line-through">{{
      formatPrice(lodPrice)
    }}</span>
  </div>
</template>

<style scoped lang="scss"></style>
