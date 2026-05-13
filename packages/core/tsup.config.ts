/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 */
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts'],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  target: 'es2020',
  splitting: true,
  clean: true,
  dts: true,
  sourcemap: true,
  treeshake: true,
  external: ['vitest', 'vitest/**'],
});
