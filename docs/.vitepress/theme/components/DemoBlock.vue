<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    source: string;
    title?: string;
  }>(),
  { title: '' },
);

const open = ref(false);
const copied = ref(false);

const normalizedSource = computed(() => props.source.replace(/\n$/, ''));

async function copySource() {
  try {
    await navigator.clipboard.writeText(normalizedSource.value);
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 1600);
  } catch {
    copied.value = false;
  }
}
</script>

<template>
  <div class="demo-block" :class="{ 'is-open': open }">
    <div v-if="title" class="demo-block__title">{{ title }}</div>
    <div class="demo-block__preview">
      <slot />
    </div>
    <div v-if="$slots.description" class="demo-block__description">
      <slot name="description" />
    </div>
    <div v-show="open" class="demo-block__source">
      <button class="demo-block__copy" type="button" @click="copySource">
        {{ copied ? '已复制' : '复制' }}
      </button>
      <pre><code>{{ normalizedSource }}</code></pre>
    </div>
    <button class="demo-block__control" type="button" @click="open = !open">
      <span class="demo-block__caret" :class="{ 'is-open': open }"></span>
      <span>{{ open ? '隐藏代码' : '显示代码' }}</span>
    </button>
  </div>
</template>

<style scoped>
.demo-block {
  margin: 16px 0 32px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.demo-block__title {
  padding: 16px 20px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.demo-block__preview {
  padding: 24px;
}

.demo-block__description {
  margin: 0 20px 16px;
  padding: 12px 16px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 6px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.7;
}

.demo-block__source {
  position: relative;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.demo-block__source pre {
  margin: 0;
  padding: 20px 24px 24px;
  overflow: auto;
  font-size: 13px;
  line-height: 1.65;
}

.demo-block__source code {
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
}

.demo-block__copy {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 2px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
}

.demo-block__copy:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.demo-block__control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 44px;
  border: 0;
  border-top: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 14px;
  cursor: pointer;
}

.demo-block__control:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.demo-block__caret {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid currentColor;
  transition: transform 0.2s ease;
}

.demo-block__caret.is-open {
  transform: rotate(180deg);
}
</style>
