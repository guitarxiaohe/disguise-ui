<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import { fetchVersion, type VersionInfo } from '../update-checker';

const visible = ref(false);
const versionInfo = ref<VersionInfo>();
let currentVersion = '';
let timer: number | undefined;

async function checkVersion() {
  try {
    const info = await fetchVersion();
    if (!currentVersion) {
      currentVersion = info.version;
      return;
    }
    if (info.version !== currentVersion) {
      versionInfo.value = info;
      visible.value = true;
      if (timer) window.clearInterval(timer);
    }
  } catch (error) {
    console.warn('[Disguise] 版本检测失败', error);
  }
}

function refresh() {
  window.location.reload();
}

function close() {
  if (versionInfo.value) currentVersion = versionInfo.value.version;
  visible.value = false;
  timer = window.setInterval(checkVersion, 60_000);
}

onMounted(() => {
  checkVersion();
  timer = window.setInterval(checkVersion, 60_000);
});

onUnmounted(() => {
  if (timer) window.clearInterval(timer);
});
</script>

<template>
  <ClientOnly>
    <el-dialog v-model="visible" title="🎉 文档站已更新" width="520px">
      <div class="update-meta">
        <el-tag size="small" type="info">版本：{{ versionInfo?.version }}</el-tag>
        <span>{{ versionInfo?.branch }} · {{ versionInfo?.hash }}</span>
      </div>
      <div class="release-notes">
        <p v-for="note in versionInfo?.releaseNotes" :key="note" class="note-item">
          {{ note }}
        </p>
      </div>
      <template #footer>
        <el-button @click="close">稍后刷新</el-button>
        <el-button type="primary" @click="refresh">立即刷新</el-button>
      </template>
    </el-dialog>
  </ClientOnly>
</template>

<style scoped>
.update-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.release-notes {
  max-height: 300px;
  overflow-y: auto;
}

.note-item {
  margin: 0 0 6px;
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  line-height: 1.6;
}
</style>
