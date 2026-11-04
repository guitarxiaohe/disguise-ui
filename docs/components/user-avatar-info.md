# UserAvatarInfo 用户头像信息

展示头像、名称和部门摘要，支持点击打开用户详情抽屉。

<script setup>
import Basic from './demos/user-avatar-info-basic.vue'
import source from './demos/user-avatar-info-basic.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `userId` | `number \| string` | — | 用户 ID |
| `name` | `string` | — | 展示名称 |
| `nickName` | `string` | `''` | 昵称 |
| `subtitle` | `string` | `''` | 副标题 |
| `deptName` | `string` | `''` | 部门名称 |
| `src` | `string` | — | 头像地址 |
| `gender` | `UserAvatarGenderInput` | — | 性别 |
| `sex` | `string` | `''` | 性别编码 |
| `size` | `number` | `30` | 头像尺寸 |
| `avatar` | `Record<string, unknown>` | — | 透传给 `ElAvatar` |
| `drawerAvatarSize` | `number` | `64` | 抽屉头像尺寸 |
| `age` | `number \| string` | — | 年龄 |
| `workYears` | `number \| string` | — | 工龄 |
| `email` | `string` | — | 邮箱 |
| `phone` | `string` | — | 手机号 |
| `department` | `string` | — | 部门 |
| `jobLevel` | `string` | — | 职级 |
| `enableDrawer` | `boolean` | `true` | 是否允许打开详情抽屉 |
| `drawerTitle` | `string` | 内置文案 | 抽屉标题 |
| `drawerSize` | `number \| string` | `'40%'` | 抽屉宽度 |
| `drawerProps` | `Record<string, unknown>` | — | 透传给 `ElDrawer` |
| `drawerVisible` | `boolean` | `false` | 详情抽屉显隐模型 |

## Slots

| 名称 | 插槽参数 | 说明 |
| --- | --- | --- |
| `avatar` | — | 触发区头像的后备内容 |
| `name` | — | 触发区名称 |
| `subtitle` | — | 触发区副标题，同时用于溢出提示 |
| `default` | — | 完整接管抽屉正文；提供后不再渲染内置详情 |
| `drawer-avatar` | — | 抽屉摘要头像 |
| `drawer-name` | — | 抽屉摘要名称 |

## 暴露方法

| 名称 | 说明 |
| --- | --- |
| `openDrawer()` | 打开详情抽屉 |
| `closeDrawer()` | 关闭详情抽屉 |
| `remoteUser` | 远程用户数据的只读引用 |
| `remoteDetail` | 完整远程响应的只读引用 |
