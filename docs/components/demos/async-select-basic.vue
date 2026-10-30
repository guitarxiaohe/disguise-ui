<script setup lang="ts">
import { ref } from 'vue';

import { AsyncSelect, getEntity } from 'disguise-ui';

const deptId = ref<number | string | null>(null);
const status = ref<string | null>(null);
const dept = getEntity('dept');
</script>

<template>
  <div style="display: flex; gap: 16px; flex-wrap: wrap">
    <div style="width: 280px">
      <p style="margin: 0 0 8px; font-size: 13px; color: var(--el-text-color-secondary)">远程部门</p>
      <AsyncSelect
        v-if="dept"
        v-model="deptId"
        :fetcher="dept.fetch"
        :columns="dept.columns"
        :value-key="dept.valueKey"
        :label-key="dept.labelKey"
        :subtitle-key="dept.subtitleKey"
        :dialog-title="dept.dialogTitle"
      />
    </div>
    <div style="width: 220px">
      <p style="margin: 0 0 8px; font-size: 13px; color: var(--el-text-color-secondary)">字典状态</p>
      <AsyncSelect v-model="status" dict-code="sys_status" />
    </div>
  </div>
  <p style="margin: 12px 0 0; font-size: 13px; color: var(--el-text-color-secondary)">
    当前值：部门 {{ deptId ?? '未选' }} / 状态 {{ status ?? '未选' }}
  </p>
</template>
