import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: 'node',
    globals: true,
    exclude: ['**/node_modules/**', '**/scripts/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
