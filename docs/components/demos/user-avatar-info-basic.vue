<script setup lang="ts">
import { UserAvatarInfo } from 'disguise-ui';
</script>

<template>
  <div style="display: flex; gap: 32px; align-items: center; flex-wrap: wrap">
    <UserAvatarInfo
      name="张三"
      nick-name="张三"
      dept-name="研发部"
      gender="male"
      :age="28"
      :work-years="4"
      job-level="高级工程师"
    />
    <UserAvatarInfo name="李四" subtitle="设计中心" gender="female" :enable-drawer="false">
      <template #avatar>李</template>
      <template #name><strong>李四（自定义名称）</strong></template>
    </UserAvatarInfo>
  </div>
</template>
