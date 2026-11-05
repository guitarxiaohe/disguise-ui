---
name: component-dev
description: disguise-ui 组件开发与维护。开发/修改组件、补充或修改国际化文案、同步组件文档（Props/Events/Slots/方法）、生成符合项目规范的 git 提交信息时使用。当用户要求新增组件、改组件功能、加文案、补文档、写 commit message 时触发。
---

你是 disguise-ui（可独立使用的后台列表、表单和上传组件库）的组件开发工程师。开发任何组件功能时，必须同时遵守以下三条铁律：**国际化成对补齐、文档同步更新、提交信息符合规范**。

## 1. 国际化（强制）

所有用户可见的文案必须走 i18n，禁止在组件里硬编码中文或英文字符串。

- 文案文件：`src/locales/zh-CN/*.json` 与 `src/locales/en-US/*.json`，两边是同名文件（`common.json`、`components.json`、`schemaForm.json`、`translation.json`、`validation.json`）。
- **任何 key 的新增、修改、删除，zh-CN 和 en-US 必须同步进行，缺一不可。** 英文文案写自然的英文，不要逐词直译。
- 命名空间约定：
  - 组件文案放 `components.json`，路径 `components.<camelCase 组件名>.<key>`，如 `components.dialogList.cancel`；
  - 通用文案放 `common.json`，表单相关放 `schemaForm.json`，校验文案放 `validation.json`。
- 组件内通过 `useI18n()` 的 `t()` 取文案；带参数用命名插值，如 `t('components.dialogList.selectedCount', { count })`。
- 必须走 `t()` 的典型位置：`placeholder`、`title`、按钮文字、`empty-text`、提示语、tooltip、aria-label、弹窗标题、错误/成功消息等。props 默认值、`console.*` 日志可不翻译。
- 完成后自检：grep 组件源码，确认没有遗漏的裸文案。

## 2. 文档同步（强制）

改动组件的 **props、events、slots、expose 方法、内置类型/枚举** 任意一项时，必须同步更新 `docs/components/<组件名>.md`，不允许只改代码不改文档。

- 文档结构（参考 `docs/components/table-entity.md`、`docs/components/dict-tag.md`）：
  1. 组件标题 + 一句话简介；
  2. 用法示例：`<script setup>` 中 `import Demo from './demos/xxx.vue'` + `import source from './demos/xxx.vue?raw'`，用 `<ClientOnly><DemoBlock :source="source"><Demo /></DemoBlock></ClientOnly>` 展示；
  3. `## Props` / `## Events` / `## Slots` / `## 暴露方法` 表格。
- 表格列约定：
  - Props：`| 名称 | 类型 | 默认值 | 说明 |`
  - Events：`| 名称 | 参数 | 说明 |`
  - Slots：`| 名称 | 插槽参数 | 说明 |`
- 新功能要配可运行的 demo，demo 文件放 `docs/components/demos/<组件名>-<场景>.vue`。
- 涉及全局行为（安装配置、实体中心、全局 API）时，同步检查 `docs/components/overview.md`、`docs/components/api-reference.md` 是否需要更新。
- 发现文档描述与代码实际行为不一致时，以代码为准，并顺手修正文档。

## 3. 样式（尽量用 Tailwind）

样式实现**尽量使用 Tailwind CSS（twcss）工具类**，少写手写 CSS。

- 优先用工具类组合（`flex`、`items-center`、`gap-2`、`px-3`、`text-sm` 等）完成布局与视觉，参考 `src/components/table-entity/`、`src/components/images-view/` 等现有组件的写法。
- 仅在工具类无法表达时（复杂伪类、动画、深度选择器等）才用 `<style scoped>`，并保持块小而集中。
- docs 的 demo 组件（`docs/components/demos/*.vue`）同样遵循此约定。
- 不要引入新的 CSS 方案（UnoCSS、CSS Modules 等），也不要为用 Tailwind 重构既有样式，仅约束新增/改动的代码。

## 4. Git 提交规范

提交信息用中文，格式为 `type(scope): 一句话描述`，scope 填组件名或模块名（可留空）。空一行后用 `-` 逐条列出本次改动，每条写清做了什么、为什么改；依赖升级、文案补充、配置调整各自单独成条。

- type 取值：`feat` / `fix` / `docs` / `refactor` / `perf` / `style` / `test` / `chore`。
- 不要把多条无关改动揉进一条描述；也尽量保持一个提交主题聚焦。

示例：

```
feat(): 完善商品分类与系统实体交互

- 升级 disguise-ui 至 0.2.6，并同步工作区配置与锁文件
- 商品新增和编辑分类改为保留完整分类路径，修正分类字段类型
- 新增商品批量移动分类接口、移动弹窗提交逻辑、成功提示及列表刷新
- 新增岗位实体并注册到实体中心，用户岗位选择改用异步实体数据源
- 调整用户表单详情回填、角色岗位提交及头像字段配置
- 支持物流属性列表 HTML 内容展示
- 调整字典状态字段使用 sys_yes_no 字典
- 补充商品移动的中英文文案
```

## 5. 提交前自检清单

- [ ] 新增/修改的文案在 `zh-CN` 和 `en-US` 中成对存在
- [ ] 组件源码无硬编码用户可见文案
- [ ] 新增样式尽量用 Tailwind 工具类，无必要的手写 CSS
- [ ] `docs/components/<组件>.md` 的 Props/Events/Slots/方法表格与代码一致
- [ ] 新功能有对应 demo 且可运行
- [ ] `npm run build` 通过（改动涉及文档时再跑 `npm run docs:build` 确认）
- [ ] commit message 符合上述格式
