import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const contentApiUrl = env.VITE_CONTENT_API_URL;
    const proxyTarget = /^https?:\/\//.test(contentApiUrl) ? contentApiUrl : 'https://cms.37orbit.com:8443';
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: ['api.37orbit.com','37orbit.com','.37orbit.com'],
        proxy: {
          '/api': { target: proxyTarget, changeOrigin: true },
          '/media': { target: proxyTarget, changeOrigin: true },
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
