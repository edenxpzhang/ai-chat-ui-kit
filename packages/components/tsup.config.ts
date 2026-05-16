
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.d.ts'],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  target: 'esnext',
  splitting: true,
  clean: true,
  dts: true,
  sourcemap: true,
  treeshake: true,
  external: ['lit', '@lit/reactive-element', 'lit-html', 'lit-element'],
  // 把 .css 当作纯文本字符串导入，作为 default export 暴露给 ts 文件，
  // 由组件源码顶部 injectStyle(id, cssText) 主动注入 <head>。
  loader: {
    '.css': 'text',
  },
});
