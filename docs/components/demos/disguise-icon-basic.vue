<script setup lang="ts">
import { DisguiseIcon } from 'disguise-ui';
</script>

<template>
  <div style="display: flex; gap: 16px; align-items: center; font-size: 22px">
    <DisguiseIcon icon="home" />
    <DisguiseIcon icon="user" />
    <DisguiseIcon icon="setting" :style="{ color: '#409eff' }" />
  </div>
  <p style="margin: 12px 0 0; font-size: 13px; color: var(--el-text-color-secondary)">
    组件只拼接 `disguiseicon-{icon}` 类名。图标字体样式需要使用方自己引入。
  </p>
</template>
