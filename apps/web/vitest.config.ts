import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'e2e/**', '.next/**', 'dist/**'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['components/**', 'lib/**', 'stores/**'],
      exclude: ['e2e/**', '__tests__/**', 'node_modules/**'],
      thresholds: { lines: 70, functions: 70, branches: 70 },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@xamle/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@xamle/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
    },
  },
});
