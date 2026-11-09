<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus';
import { ref } from 'vue';

import { ImportDialog } from 'disguise-ui';

const visible = ref(false);

const targetFields = [
  { field: 'name', label: '名称', required: true },
  { field: 'status', label: '状态' },
  { field: 'job', label: '岗位' },
];

const IMPORTDOC = `
一、Excel文件要求
    • 文件格式：必须是 .xlsx 格式（Excel 2007及以上版本）
    • 文件命名：只能用英文、数字、下划线，例如：upload_template_2026.xlsx
    • 禁止使用：中文、空格、特殊符号（如：@、#、$、%等）
    • 模版下载：下载模版

        `;
</script>

<template>
  <ElButton type="primary" @click="visible = true">打开导入</ElButton>
  <ImportDialog
    v-model="visible"
    :target-fields="targetFields"
    :tips="[
      '文档站示例不会真正请求后台',
      '选择任意 xlsx / csv 后可走完映射流程',
    ]"
    :importDesc="IMPORTDOC"
    :parse-file="
      async ({ file }) => ({
        fileName: file.name,
        total: 2,
        sheets: [{ label: 'Sheet1', value: 'Sheet1' }],
        currentSheet: 'Sheet1',
        previewColumns: [
          { prop: 'name', label: '名称' },
          { prop: 'status', label: '状态' },
        ],
        previewRows: [
          { name: '张三', status: '启用' },
          { name: '李四', status: '停用' },
        ],
        mappings: [
          {
            targetField: 'name',
            targetLabel: '名称',
            sourceColumn: 'name',
            required: true,
            duplicateCheck: false,
          },
          {
            targetField: 'status',
            targetLabel: '状态',
            sourceColumn: 'status',
            duplicateCheck: false,
          },
        ],
      })
    "
    :submit-import="
      async () => {
        ElMessage.success('示例导入完成');
        return {
          success: true,
          title: '导入成功',
          successCount: 2,
          failureCount: 0,
        };
      }
    "
  />
</template>
