
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/*/src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'packages/*/dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['packages/*/src/**/*.test.ts', 'packages/*/src/types/**'],
    },
  },
  resolve: {
    alias: {
      '@ai-chat/core': path.resolve(__dirname, 'packages/core/src'),
      '@ai-chat/components': path.resolve(__dirname, 'packages/components/src'),
      '@ai-chat/themes': path.resolve(__dirname, 'packages/themes/src'),
    },
  },
});
