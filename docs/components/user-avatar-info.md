# UserAvatarInfo 用户头像信息

展示头像、名称和部门摘要，支持点击打开用户详情抽屉。

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
