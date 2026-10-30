<script setup lang="ts">
import { DictTag } from 'disguise-ui';
</script>

<template>
  <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
    <DictTag code="sys_status" value="1" />
    <DictTag code="sys_status" value="0" />
    <DictTag code="sys_user_sex" value="1" />
    <DictTag code="sys_user_sex" value="2" />
    <DictTag label="自定义" color="#7c3aed" />
  </div>
</template>
