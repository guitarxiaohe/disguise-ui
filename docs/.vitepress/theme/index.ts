import { VueQueryPlugin } from '@tanstack/vue-query';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';

import { setupDocsRuntime } from '../runtime';
import DemoBlock from './components/DemoBlock.vue';
import UpdateNotification from './components/UpdateNotification.vue';

import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import '../../../src/theme.css';
import './style.css';

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(UpdateNotification),
    }),
  enhanceApp({ app }) {
    setupDocsRuntime();
    app.use(ElementPlus, { locale: zhCn });
    app.use(VueQueryPlugin);
    app.component('DemoBlock', DemoBlock);
    app.directive('access', {});
  },
} satisfies Theme;
