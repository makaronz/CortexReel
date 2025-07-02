import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './setupTests.ts',
    include: ['src/__tests__/monitoringDashboard.test.ts', 'src/__tests__/diagrams.test.ts']
  }
});
