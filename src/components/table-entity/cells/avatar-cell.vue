<script setup lang="ts">
import { computed } from 'vue';

import UserAvatarInfo from '@/components/user-avatar-info/index.vue';

const props = withDefaults(
  defineProps<{
    row?: Record<string, any>;
    value?: null | number | string;
  }>(),
  {
    row: () => ({}),
    value: null,
  },
);

/** 与 UserAvatarInfo props 同名的字段，直接透传（cellProps 可按行补充） */
const INFO_KEYS = [
  'userId',
  'nickName',
  'subtitle',
  'gender',
  'sex',
  'age',
  'workYears',
  'jobLevel',
  'email',
  'phone',
  'department',
  'deptName',
  'size',
  'drawerAvatarSize',
  'drawerTitle',
  'drawerSize',
  'drawerProps',
  'enableDrawer',
] as const;

const userProps = computed(() => {
  const out: Record<string, any> = {};
  for (const key of INFO_KEYS) {
    if (props.row[key] !== undefined) out[key] = props.row[key];
  }
  return out;
});

/** row.userName 为行内约定的名称字段，映射到 name */
const name = computed(() => props.row?.name ?? props.row?.userName ?? '');
/** row.avatar 约定为图片地址，映射到 src */
const src = computed(() =>
  typeof props.row?.avatar === 'string'
    ? props.row.avatar
    : (props.row?.src ?? ''),
);
/** el-avatar 透传属性对象：row.avatar 为对象时兼容，或显式传 row.avatarProps */
const avatarProps = computed(() =>
  props.row?.avatar && typeof props.row.avatar === 'object'
    ? props.row.avatar
    : props.row?.avatarProps,
);
</script>
<template>
  <UserAvatarInfo
    v-bind="userProps"
    :name="name"
    :src="src"
    :avatar="avatarProps"
  />
</template>

<style scoped lang="scss"></style>
