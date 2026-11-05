<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus';
import { ref } from 'vue';

import { ImportDialog } from 'disguise-ui';

const visible = ref(false);

const targetFields = [
  { field: 'code', label: '编码', required: true, allowDuplicateCheck: false },
  { field: 'name', label: '名称' },
  { field: 'mobile', label: '手机号' },
];

const previewColumns = [
  { prop: 'code', label: '编码' },
  { prop: 'name', label: '名称' },
  { prop: 'mobile', label: '手机号' },
];

const previewRows = [
  { code: 'A001', name: '张三', mobile: '13800000000' },
  { code: 'A002', name: '李四', mobile: '13900000000' },
];
</script>

<template>
  <ElButton type="primary" @click="visible = true"
    >打开导入（查重策略）</ElButton
  >
  <ImportDialog
    v-model="visible"
    :target-fields="targetFields"
    :tips="[
      '映射页的「查重」列决定该字段是否按来源列查重',
      '编码的查重勾选被 allowDuplicateCheck: false 锁定为不查重',
    ]"
    :parse-file="
      async ({ file }) => ({
        fileName: file.name,
        total: previewRows.length,
        sheets: [{ label: 'Sheet1', value: 'Sheet1' }],
        currentSheet: 'Sheet1',
        previewColumns,
        previewRows,
        mappings: [
          {
            targetField: 'code',
            targetLabel: '编码',
            sourceColumn: 'code',
            required: true,
            duplicateCheck: false,
            allowDuplicateCheck: false,
          },
          {
            targetField: 'name',
            targetLabel: '名称',
            sourceColumn: 'name',
            duplicateCheck: false,
          },
          {
            targetField: 'mobile',
            targetLabel: '手机号',
            sourceColumn: 'mobile',
            duplicateCheck: true,
          },
        ],
      })
    "
    :submit-import="
      async ({ mappings }) => {
        const checked = mappings
          .filter((m) => m.duplicateCheck)
          .map((m) => m.targetLabel);
        ElMessage.success(
          checked.length
            ? `按查重提交：${checked.join('、')}`
            : '本次导入未开启查重',
        );
        return { success: true, title: '导入成功' };
      }
    "
  />
</template>
