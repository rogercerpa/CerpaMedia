<<<<<<< HEAD
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    exclude: ['**/node_modules/**', '**/scripts/**'],
=======
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
>>>>>>> 84601b3 (Add Services CMS with full CRUD, reordering, and soft delete)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
<<<<<<< HEAD
});
=======
})
>>>>>>> 84601b3 (Add Services CMS with full CRUD, reordering, and soft delete)
