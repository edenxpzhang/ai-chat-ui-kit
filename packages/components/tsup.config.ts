/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 * @updated 2026-05-15  排除 .d.ts；react.d.ts 通过 package.json build 脚本 copy 到 dist
 * @updated 2026-05-15  将 .css 作为 text 内联进 JS，运行时通过 injectStyle 注入 <head>，
 *                       彻底解决宿主项目忘记 import 'dist/index.css' 导致 light DOM 组件无样式的问题。
 *                       聚合 dist/index.css 由 build 脚本（拼接 src/**\/*.css）单独生成，保留向后兼容。
 */
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
