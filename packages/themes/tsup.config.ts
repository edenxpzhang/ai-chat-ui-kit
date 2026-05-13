/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 */
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/default/index.ts', 'src/bubble/index.ts', 'src/flat/index.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'es2020',
  splitting: true,
  clean: true,
  dts: true,
  sourcemap: false,
  treeshake: false,
  external: [],
  loader: {
    '.css': 'copy',
  },
});
