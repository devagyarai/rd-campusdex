import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      all: true,
      include: ['app/**/*.ts', 'app/**/*.tsx', 'components/**/*.ts', 'components/**/*.tsx', 'lib/**/*.ts'],
      exclude: ['node_modules', 'tests', '**/*.d.ts', '**/*.test.ts', '**/*.test.tsx'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
        'app/api/auth/**/*.ts': { lines: 95 },
        'app/api/upload/**/*.ts': { lines: 100 },
        'app/api/student/profile/password-reset/**/*.ts': { lines: 100 },
        'app/api/**/*.ts': { lines: 90 },
      },
    },
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
