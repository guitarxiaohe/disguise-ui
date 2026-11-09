<script setup lang="ts">
import { ref } from 'vue';
import { ElButton } from 'element-plus';
import { Briefcase, MapPin } from 'lucide-vue-next';

import type { UserAvatarDrawerField } from 'disguise-ui';
import { UserAvatarInfo } from 'disguise-ui';

const drawerVisible = ref(false);

/** 通过 drawerFields 决定展示哪些字段、字段名、顺序与图标 */
const fields: UserAvatarDrawerField[] = [
  { key: 'name', label: '用户名' },
  { key: 'department' },
  { key: 'jobLevel', label: '职级（自定义图标）', icon: Briefcase },
  { key: 'email' },
  { key: 'city', label: '所在城市', icon: MapPin, value: '杭州' },
];
</script>

<template>
  <div style="display: flex; gap: 32px; align-items: center; flex-wrap: wrap">
    <UserAvatarInfo
      v-model:drawer-visible="drawerVisible"
      name="张三"
      nick-name="张三"
      dept-name="研发部"
      gender="male"
      :age="28"
      work-years="4"
      job-level="高级工程师"
      phone="13800000000"
      email="zhangsan@example.com"
      :drawer-fields="fields"
    />
    <ElButton @click="drawerVisible = !drawerVisible">
      {{ drawerVisible ? '关闭抽屉' : '打开抽屉' }}
    </ElButton>
  </div>
</template>
