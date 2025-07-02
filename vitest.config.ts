import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './setupTests.ts',
    include: [
      'src/__tests__/monitoringDashboard.test.ts',
      'src/__tests__/diagrams.test.ts',
      'src/__tests__/monitoringIntegration.test.ts'
    ]
  }
,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/views': path.resolve(__dirname, './src/views')
    }
  }
});
