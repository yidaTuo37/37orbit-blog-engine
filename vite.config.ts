import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const contentApiUrl = env.VITE_CONTENT_API_URL || 'http://localhost:3000';
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
        allowedHosts: ['api.37orbit.com','37orbit.com','.37orbit.com'],
        proxy: {
          '/api': {
            target: contentApiUrl,
            changeOrigin: true,
          },
          '/media': {
            target: contentApiUrl,
            changeOrigin: true,
          },
        },
      },
      plugins: [react()],
      // define: {
      //   'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      //   'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      // },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
