<script setup lang="ts">
import { ElButton } from 'element-plus';
import { ref } from 'vue';

import { UserAvatarInfo } from 'disguise-ui';

const drawerVisible = ref(false);
</script>

<template>
  <div style="display: flex; gap: 32px; align-items: center; flex-wrap: wrap">
    <UserAvatarInfo
      v-model:drawer-visible="drawerVisible"
      name="张三"
      nick-name="张三"
      dept-name="研发部"
      gender="male"
    >
      <template #avatar>张</template>
      <div style="display: flex; flex-direction: column; gap: 8px">
        <strong>张三 · 高级工程师</strong>
        <span>默认插槽完整接管抽屉正文，可以在这里渲染任意详情内容。</span>
      </div>
    </UserAvatarInfo>
    <ElButton @click="drawerVisible = !drawerVisible">
      {{ drawerVisible ? '关闭抽屉' : '打开抽屉' }}
    </ElButton>
  </div>
</template>
