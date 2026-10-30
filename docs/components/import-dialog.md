# ImportDialog 导入

Excel / CSV 导入弹窗，包含上传、预览、字段映射和结果反馈。`CrudPage` 传入 `importUrl` 后会自动使用它。

<script setup>
import Basic from './demos/import-dialog-basic.vue'
import source from './demos/import-dialog-basic.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

可以传入 `api` / `templateUrl` 让组件内部发请求，也可以自己实现 `parseFile` 和 `submitImport`。

## Props

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `modelValue` | `boolean` | 显隐 |
| `api` | `string` | 导入接口 |
| `templateUrl` | `string` | 模板下载接口 |
| `targetFields` | `ImportDialogTargetField[]` | 目标字段 |
| `parseFile` | `(payload) => Promise<result>` | 自定义解析 |
| `submitImport` | `(payload) => Promise<result>` | 自定义提交 |
| `tips` | `string[]` | 上传页提示 |
