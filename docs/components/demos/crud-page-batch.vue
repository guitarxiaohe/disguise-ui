<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

import { CrudPage } from 'disguise-ui';
import type { CrudPageField, CrudPageToolbarAction } from 'disguise-ui';

import { mockUsers } from '../../.vitepress/mock';

const rows = ref(mockUsers.map((item) => ({ ...item })));

const fields: CrudPageField[] = [
  {
    prop: 'name',
    label: '名称',
    type: 'text',
    table: { width: 140 },
  },
  {
    prop: 'job',
    label: '岗位',
    type: 'select',
    optionSource: 'dict',
    dictCode: 'sys_job',
    table: { width: 140, type: 'dict', dictCode: 'sys_job' },
  },
  {
    prop: 'deptName',
    label: '部门',
    type: 'text',
    table: { width: 160 },
  },
];

const toolbarActions: CrudPageToolbarAction[] = [
  { name: 'sync', label: '同步数据', type: 'primary' },
];

function handleBatchDelete(selected: Record<string, any>[]) {
  const ids = new Set(selected.map((row) => row.id));
  rows.value = rows.value.filter((item) => !ids.has(item.id));
  ElMessage.success(`已删除 ${selected.length} 行`);
}

function handleToolbarAction(name: string) {
  ElMessage.info(`点击了追加按钮：${name}`);
}
</script>

<template>
  <CrudPage
    :fields="fields"
    :data="rows"
    :on-batch-delete="handleBatchDelete"
    :push-toolbar-actions="toolbarActions"
    :show-import="false"
    :table-props="{ height: 300, showPagination: false }"
    @toolbar-action="handleToolbarAction"
  />
</template>
