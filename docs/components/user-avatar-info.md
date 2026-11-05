# UserAvatarInfo 用户头像信息

展示头像、名称和部门摘要，支持点击打开用户详情抽屉。

<script setup>
import Basic from './demos/user-avatar-info-basic.vue'
import source from './demos/user-avatar-info-basic.vue?raw'
import Drawer from './demos/user-avatar-info-drawer.vue'
import drawerSource from './demos/user-avatar-info-drawer.vue?raw'
</script>

## 基础用法

<ClientOnly>
  <DemoBlock :source="source">
    <Basic />
  </DemoBlock>
</ClientOnly>

触发区展示头像（`avatar` 插槽或名称首字）、名称和副标题。名称取 `nickName || name`，副标题取 `subtitle || deptName`；副标题溢出时 hover 显示全文。

## 详情抽屉

`enableDrawer` 开启时点击头像区域（或聚焦后按 Enter / 空格）打开详情抽屉，显隐可用 `v-model:drawerVisible` 外部控制。提供 `default` 插槽后，抽屉正文由调用方完整接管。

<ClientOnly>
  <DemoBlock :source="drawerSource">
    <Drawer />
  </DemoBlock>
</ClientOnly>

未提供 `default` 插槽时渲染内置详情：年龄、工龄、职级来自对应 props；姓名、性别、电话、邮箱、部门依赖远程用户数据（当前版本未启用远程拉取，这些字段会显示为空）。

## Props

| 名称               | 类型                      | 默认值   | 说明                                                               |
| ------------------ | ------------------------- | -------- | ------------------------------------------------------------------ |
| `userId`           | `number \| string`        | —        | 用户 ID；传入后头像右下角展示在线状态角标                          |
| `name`             | `string`                  | —        | 展示名称                                                           |
| `nickName`         | `string`                  | `''`     | 昵称，优先于 `name` 展示                                           |
| `subtitle`         | `string`                  | `''`     | 副标题，优先于 `deptName`；溢出时 hover 显示全文                   |
| `deptName`         | `string`                  | `''`     | 部门名称                                                           |
| `src`              | `string`                  | —        | 头像地址                                                           |
| `gender`           | `UserAvatarGenderInput`   | —        | 性别；`'male'` / `'female'` 时展示角标并着色                       |
| `sex`              | `string`                  | `''`     | 性别编码，`'0'` 男 / `'1'` 女（`gender` 未传时生效）               |
| `size`             | `number`                  | `30`     | 头像尺寸                                                           |
| `avatar`           | `Record<string, unknown>` | —        | 透传给 `ElAvatar`                                                  |
| `drawerAvatarSize` | `number`                  | `64`     | 抽屉头像尺寸                                                       |
| `age`              | `number \| string`        | —        | 年龄                                                               |
| `workYears`        | `number \| string`        | —        | 工龄                                                               |
| `email`            | `string`                  | —        | 邮箱（当前版本未参与渲染）                                         |
| `phone`            | `string`                  | —        | 手机号（当前版本未参与渲染）                                       |
| `department`       | `string`                  | —        | 部门（当前版本未参与渲染，触发区副标题取 `subtitle` / `deptName`） |
| `jobLevel`         | `string`                  | —        | 职级                                                               |
| `enableDrawer`     | `boolean`                 | `true`   | 是否允许打开详情抽屉                                               |
| `drawerTitle`      | `string`                  | 内置文案 | 抽屉标题                                                           |
| `drawerSize`       | `number \| string`        | `'40%'`  | 抽屉宽度                                                           |
| `drawerProps`      | `Record<string, unknown>` | —        | 透传给 `ElDrawer`                                                  |
| `drawerVisible`    | `boolean`                 | `false`  | 详情抽屉显隐模型                                                   |

`UserAvatarGenderInput`：`1 | 2 | '' | 'F' | 'f' | 'female' | 'M' | 'm' | 'male' | 'unknown' | '女' | '男'`。当前仅 `'male'` / `'female'` 会触发角标与着色，其余取值按未识别处理。

## Events

| 名称                   | 参数               | 说明             |
| ---------------------- | ------------------ | ---------------- |
| `update:drawerVisible` | `visible: boolean` | 详情抽屉显隐变化 |

## Slots

| 名称            | 插槽参数 | 说明                                     |
| --------------- | -------- | ---------------------------------------- |
| `avatar`        | —        | 触发区头像的后备内容                     |
| `name`          | —        | 触发区名称                               |
| `subtitle`      | —        | 触发区副标题，同时用于溢出提示           |
| `default`       | —        | 完整接管抽屉正文；提供后不再渲染内置详情 |
| `drawer-avatar` | —        | 抽屉摘要头像                             |
| `drawer-name`   | —        | 抽屉摘要名称                             |

## 暴露方法

| 名称            | 说明                   |
| --------------- | ---------------------- |
| `openDrawer()`  | 打开详情抽屉           |
| `closeDrawer()` | 关闭详情抽屉           |
| `remoteUser`    | 远程用户数据的只读引用 |
| `remoteDetail`  | 完整远程响应的只读引用 |

当前版本未启用远程拉取：`remoteDetail` 恒为 `null`、`remoteUser` 恒为 `undefined`，在线状态角标恒为离线样式。
