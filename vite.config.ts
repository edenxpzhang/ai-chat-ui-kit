
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'examples'),
  publicDir: resolve(__dirname, 'packages'),
  server: {
    port: 3000,
    open: '/index.html',
  },
  build: {
    outDir: resolve(__dirname, 'dist-examples'),
  },
  resolve: {
    alias: {
      '@ai-chat/core': resolve(__dirname, 'packages/core/src'),
      '@ai-chat/components': resolve(__dirname, 'packages/components/src'),
      '@ai-chat/themes': resolve(__dirname, 'packages/themes/src'),
    },
  },
});
