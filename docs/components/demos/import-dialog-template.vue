<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus';
import { ref } from 'vue';

import { ImportDialog } from 'disguise-ui';

const visible = ref(false);

const targetFields = [{ field: 'name', label: '名称', required: true }];

// 未传 templateUrl 时，组件把模板下载交还给调用方
function handleDownloadTemplate() {
  ElMessage.info('文档站示例：在这里触发你自己的模板下载逻辑');
}
</script>

<template>
  <ElButton type="primary" @click="visible = true"
    >打开导入（自定义模板下载）</ElButton
  >
  <ImportDialog
    importDesc="打开导入（自定义模板下载）"
    v-model="visible"
    :target-fields="targetFields"
    :tips="[
      '不传 templateUrl 时，点击「下载模板」会抛出 downloadTemplate 事件',
    ]"
    :parse-file="
      async ({ file }) => ({
        fileName: file.name,
        total: 1,
        sheets: [{ label: 'Sheet1', value: 'Sheet1' }],
        currentSheet: 'Sheet1',
        previewColumns: [{ prop: 'name', label: '名称' }],
        previewRows: [{ name: '张三' }],
        mappings: [
          {
            targetField: 'name',
            targetLabel: '名称',
            sourceColumn: 'name',
            required: true,
            duplicateCheck: false,
          },
        ],
      })
    "
    :submit-import="async () => ({ success: true, title: '导入成功' })"
    @download-template="handleDownloadTemplate"
  />
</template>
