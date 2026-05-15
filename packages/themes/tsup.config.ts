/**
 * @generated-by AI: edenxpzhang
 * @generated-date 2026-05-13
 * @updated 2026-05-15  修正 entry 去掉历史 default/bubble/flat
 */
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/minimal/index.ts',
    'src/neon/index.ts',
    'src/glass/index.ts',
    'src/terminal/index.ts',
    'src/gradient/index.ts',
    'src/corporate/index.ts',
  ],
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
