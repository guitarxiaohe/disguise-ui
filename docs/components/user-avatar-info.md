# UserAvatarInfo 用户头像信息

展示头像、名称和部门摘要，支持点击打开用户详情抽屉。

<script setup>
import Basic from './demos/user-avatar-info-basic.vue'
import source from './demos/user-avatar-info-basic.vue?raw'
import Drawer from './demos/user-avatar-info-drawer.vue'
import drawerSource from './demos/user-avatar-info-drawer.vue?raw'
import DrawerFields from './demos/user-avatar-info-drawer-fields.vue'
import drawerFieldsSource from './demos/user-avatar-info-drawer-fields.vue?raw'
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

未提供 `default` 插槽时渲染内置详情：姓名取 `nickName || name`，性别由 `gender` / `sex` 推断；年龄、工龄、职级、电话、邮箱、部门来自对应 props（部门未传时回退 `deptName`），为空时显示「暂无」。

## 自定义抽屉字段

配置详情卡片展示哪些字段、字段名（label）、顺序与图标，有两种注入方式：

- **全局注入**：`setupDisguise({ userAvatarDrawerFields })` 配置一套全局默认字段，所有 `UserAvatarInfo` 生效；
- **prop 覆盖**：组件 `drawerFields` prop，优先于全局配置，只影响当前组件。

两者都不传时保持默认 8 个字段（`name` / `gender` / `age` / `workYears` / `jobLevel` / `phone` / `email` / `department`）及其默认文案。

<ClientOnly>
  <DemoBlock :source="drawerFieldsSource">
    <DrawerFields />
  </DemoBlock>
</ClientOnly>

每个字段为 `UserAvatarDrawerField`：

- `key`：匹配内置取值、默认 label 与默认 icon 的字段 key；
- `label`：字段名，不传时内置字段取默认国际化文案，未知 key 回退为 `key` 本身；
- `icon`：字段图标，不传时取内置映射（未知 key 使用默认图标）；
- `value`：自定义展示值，优先于内置 key 的默认取值，空值统一显示「暂无」。

内置字段（`name` / `gender` / `age` / `workYears` / `jobLevel` / `phone` / `email` / `department`）不传 `value` 时仍取对应 props 的展示值；也可追加自定义字段（额外 `key` + `value` + `label` / `icon`）。

## Props

| 名称               | 类型                      | 默认值   | 说明                                                                                                            |
| ------------------ | ------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `userId`           | `number \| string`        | —        | 用户 ID；传入后头像右下角展示在线状态角标                                                                       |
| `name`             | `string`                  | —        | 展示名称                                                                                                        |
| `nickName`         | `string`                  | `''`     | 昵称，优先于 `name` 展示                                                                                        |
| `subtitle`         | `string`                  | `''`     | 副标题，优先于 `deptName`；溢出时 hover 显示全文                                                                |
| `deptName`         | `string`                  | `''`     | 部门名称                                                                                                        |
| `src`              | `string`                  | —        | 头像地址                                                                                                        |
| `gender`           | `UserAvatarGenderInput`   | —        | 性别；`'male'` / `'female'` 时展示角标并着色                                                                    |
| `sex`              | `string`                  | `''`     | 性别编码，`'0'` 男 / `'1'` 女（`gender` 未传时生效）                                                            |
| `size`             | `number`                  | `30`     | 头像尺寸                                                                                                        |
| `avatar`           | `Record<string, unknown>` | —        | 透传给 `ElAvatar`                                                                                               |
| `drawerAvatarSize` | `number`                  | `64`     | 抽屉头像尺寸                                                                                                    |
| `age`              | `number \| string`        | —        | 年龄                                                                                                            |
| `workYears`        | `number \| string`        | —        | 工龄                                                                                                            |
| `email`            | `string`                  | —        | 邮箱（抽屉详情展示）                                                                                            |
| `phone`            | `string`                  | —        | 手机号（抽屉详情展示）                                                                                          |
| `department`       | `string`                  | —        | 部门（抽屉详情展示，未传时回退 `deptName`；触发区副标题取 `subtitle` / `deptName`）                             |
| `jobLevel`         | `string`                  | —        | 职级                                                                                                            |
| `enableDrawer`     | `boolean`                 | `true`   | 是否允许打开详情抽屉                                                                                            |
| `drawerTitle`      | `string`                  | 内置文案 | 抽屉标题                                                                                                        |
| `drawerSize`       | `number \| string`        | `'40%'`  | 抽屉宽度                                                                                                        |
| `drawerProps`      | `Record<string, unknown>` | —        | 透传给 `ElDrawer`                                                                                               |
| `drawerFields`     | `UserAvatarDrawerField[]` | —        | 抽屉详情卡片字段配置：展示哪些字段、label、顺序与图标；优先于全局 `userAvatarDrawerFields`，不传时为默认 8 字段 |
| `drawerVisible`    | `boolean`                 | `false`  | 详情抽屉显隐模型                                                                                                |

`UserAvatarGenderInput`：`1 | 2 | '' | 'F' | 'f' | 'female' | 'M' | 'm' | 'male' | 'unknown' | '女' | '男'`。当前仅 `'male'` / `'female'` 会触发角标与着色，其余取值按未识别处理。

`UserAvatarDrawerField`：

| 名称    | 类型               | 默认值 | 说明                                                         |
| ------- | ------------------ | ------ | ------------------------------------------------------------ |
| `key`   | `string`           | —      | 字段 key，匹配内置取值、默认 label 与默认 icon               |
| `label` | `string`           | —      | 字段名；内置字段回退默认国际化文案，未知 key 回退 `key` 本身 |
| `icon`  | `Component`        | —      | 字段图标；不传时取内置映射，未知 key 使用默认图标            |
| `value` | `string \| number` | —      | 自定义展示值，优先于内置取值；空值显示「暂无」               |

类型从 `disguise-ui` 导出：`import type { UserAvatarDrawerField } from 'disguise-ui'`。全局注入方式见 [运行时注入](../guide/runtime.md#useravatarinfo-抽屉字段)。

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

| 名称            | 说明         |
| --------------- | ------------ |
| `openDrawer()`  | 打开详情抽屉 |
| `closeDrawer()` | 关闭详情抽屉 |

当前版本在线状态角标恒为离线样式。
