<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    price: string;
    oldPrice: string;
    unit?: string;
    toFixed?: number;

    style?: Record<string, string>;
    oldPriceStyle?: Record<string, string>;
  }>(),
  {
    price: '',
    /**
     * 老价格 带航线
     */
    oldPrice: '',

    unit: '$',
    toFixed: 2,
    style: () => ({}),
    oldPriceStyle: () => ({}),
  },
);

const formatPrice = (val: string | number) => {
  const raw = String(val ?? '').replace(/[^0-9.-]/g, '');
  const num = parseFloat(raw);
  const fixed = isNaN(num) ? '0.00' : num.toFixed(props.toFixed);
  return `${props.unit}${fixed}`;
};
</script>

<template>
  <div class="price-cell">
    <span class="text-[red]" :style="props.style">
      {{ formatPrice(price) }}
    </span>
    <span
      v-if="oldPrice"
      class="ml-1 line-through"
      :style="props.oldPriceStyle"
    >
      {{ formatPrice(oldPrice) }}
    </span>
  </div>
</template>

<style scoped lang="scss"></style>
