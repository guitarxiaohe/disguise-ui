# 安装

Disguise 是一套可独立使用的 Vue 3 组件库，面向后台的列表、表单和上传场景。它建立在 Element Plus 之上，不内置具体业务接口。

## 环境

- Vue 3.5+
- Element Plus 2.14+
- Node.js 22+（文档站开发时）

## 使用包管理器

```bash
npm install disguise-ui vue element-plus @element-plus/icons-vue @vueuse/core @tanstack/vue-query dayjs vue-draggable-plus lucide-vue-next
```

富文本还需要：

```bash
npm install @tiptap/vue-3 @tiptap/starter-kit @tiptap/extension-color @tiptap/extension-font-family @tiptap/extension-highlight @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-table @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-table-row @tiptap/extension-text-align @tiptap/extension-text-style @tiptap/extension-underline
```

## 引入样式

```ts
import 'element-plus/dist/index.css';
import 'disguise-ui/style.css';
```
## 注意！！！！！！！！
###  disguise-ui 内部用到的 Element Plus 组件样式。包只带自己的 style.css，不带这些样式；本项目按需引入，扫不到 node_modules。

``` ts
import 'element-plus/es/components/button/style/css';
import 'element-plus/es/components/card/style/css';
import 'element-plus/es/components/cascader/style/css';
import 'element-plus/es/components/checkbox/style/css';
import 'element-plus/es/components/col/style/css';
import 'element-plus/es/components/date-picker/style/css';
import 'element-plus/es/components/dialog/style/css';
import 'element-plus/es/components/drawer/style/css';
import 'element-plus/es/components/dropdown/style/css';
import 'element-plus/es/components/empty/style/css';
import 'element-plus/es/components/form/style/css';
import 'element-plus/es/components/form-item/style/css';
import 'element-plus/es/components/icon/style/css';
import 'element-plus/es/components/image/style/css';
import 'element-plus/es/components/image-viewer/style/css';
import 'element-plus/es/components/input/style/css';
import 'element-plus/es/components/input-number/style/css';
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/message-box/style/css';
import 'element-plus/es/components/pagination/style/css';
import 'element-plus/es/components/popover/style/css';
import 'element-plus/es/components/progress/style/css';
import 'element-plus/es/components/radio/style/css';
import 'element-plus/es/components/row/style/css';
import 'element-plus/es/components/select/style/css';
import 'element-plus/es/components/select-v2/style/css';
import 'element-plus/es/components/switch/style/css';
import 'element-plus/es/components/table/style/css';
import 'element-plus/es/components/table-v2/style/css';
import 'element-plus/es/components/tabs/style/css';
import 'element-plus/es/components/tooltip/style/css';
import 'element-plus/es/components/upload/style/css';
import 'element-plus/es/components/calendar/style/css';
```




部分展示组件使用了 Tailwind 工具类。使用方需要把构建产物加进 Tailwind 扫描范围：

```js
content: ['./node_modules/disguise-ui/dist/**/*.js']
```

文档站已经配置了 Tailwind，所以这里的示例会按组件真实样式渲染。

## 本地开发这份仓库

```bash
npm install
npm run docs:dev
```

浏览器打开提示的本地地址，即可看到和 Element 类似的说明站点：左侧组件导航、中间实时示例、右侧本页目录。
