import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
  build: {
    cssCodeSplit: false,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      fileName: 'disguise-ui',
      formats: ['es'],
      name: 'Disguise',
    },
    rollupOptions: {
      external: (id) =>
        !id.startsWith('@/') &&
        !id.startsWith('.') &&
        !id.startsWith('/') &&
        !id.startsWith('\0') &&
        !id.startsWith(srcDir),
      output: {
        assetFileNames: 'style.css',
      },
    },
  },
});
