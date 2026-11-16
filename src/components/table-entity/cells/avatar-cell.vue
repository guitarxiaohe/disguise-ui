<script setup lang="ts">
import type { AvatarCellProps } from '@/composables/use-avatar-cell';
import { useAvatarCell } from '@/composables/use-avatar-cell';
import UserAvatarInfo from '@/components/user-avatar-info/index.vue';

const props = withDefaults(defineProps<AvatarCellProps>(), {
  row: () => ({}),
  field: '',
  cellProps: () => ({}),
});

const userProps = useAvatarCell(props);
</script>
<template>
  <UserAvatarInfo v-bind="userProps" />
</template>

<style scoped lang="scss"></style>
