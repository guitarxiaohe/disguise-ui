import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-CN',
  title: 'Disguise',
  description: 'Disguise：可独立使用的后台列表、表单和上传组件',
  lastUpdated: true,
  cleanUrls: true,
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Disguise',
    outline: { label: '本页目录', level: [2, 3] },
    docFooter: { prev: '上一页', next: '下一页' },
    lastUpdated: { text: '最后更新' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除',
            backButtonTitle: '关闭',
            noResultsText: '没有找到结果',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },
    nav: [
      { text: '指南', link: '/guide/installation' },
      { text: '组件', link: '/components/crud-page' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开发指南',
          items: [
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/quickstart' },
            { text: '运行时注入', link: '/guide/runtime' },
          ],
        },
      ],
      '/components/': [
        {
          text: 'Overview',
          items: [{ text: '组件总览', link: '/components/overview' }],
        },
        {
          text: '页面',
          items: [{ text: 'CrudPage 增删改查页', link: '/components/crud-page' }],
        },
        {
          text: '数据录入',
          items: [
            { text: 'SchemaForm 元数据表单', link: '/components/schema-form' },
            { text: 'SearchForm 搜索表单', link: '/components/search-form' },
            { text: 'DrawerFormPage 抽屉表单', link: '/components/drawer-form-page' },
            { text: 'AsyncSelect 远程选择', link: '/components/async-select' },
            { text: 'PictureUpload 图片上传', link: '/components/picture-upload' },
            { text: 'ImageUpload 头像上传', link: '/components/image-upload' },
            { text: 'RichTextEditor 富文本', link: '/components/rich-text-editor' },
          ],
        },
        {
          text: '数据展示',
          items: [
            { text: 'TableEntity 表格', link: '/components/table-entity' },
            { text: 'ImagesView 图片预览', link: '/components/images-view' },
            { text: 'DictTag 字典标签', link: '/components/dict-tag' },
            { text: 'BaseCard 卡片', link: '/components/base-card' },
          ],
        },
        {
          text: '反馈',
          items: [{ text: 'ImportDialog 导入', link: '/components/import-dialog' }],
        },
        {
          text: '其他',
          items: [{ text: 'DisguiseIcon 图标', link: '/components/disguise-icon' }],
        },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../../src', import.meta.url)),
        'disguise-ui': fileURLToPath(new URL('../../src/index.ts', import.meta.url)),
      },
    },
    ssr: {
      noExternal: [
        'element-plus',
        '@element-plus/icons-vue',
        '@tanstack/vue-query',
        '@vueuse/core',
        'vue-draggable-plus',
        'lucide-vue-next',
        'dayjs',
      ],
    },
  },
});
