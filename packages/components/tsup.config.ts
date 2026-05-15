/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 * @updated 2026-05-15  排除 .d.ts；react.d.ts 通过 package.json build 脚本 copy 到 dist
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
});
