import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
    },
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
    },
    server: {
      port: 5173,
      open: true
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  };
}); 