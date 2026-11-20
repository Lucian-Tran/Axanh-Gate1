import { defineConfig } from 'vite';

export default defineConfig({
  root: 'FrontEnd',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '^/api/': {
        target: 'http://127.0.0.1:3100',
        changeOrigin: false,
      },
      '^/auth/': {
        target: 'http://127.0.0.1:3100',
        changeOrigin: false,
      },
      '/dev-login': {
        target: 'http://127.0.0.1:3100',
        changeOrigin: false,
      },
      '/dev-logout': {
        target: 'http://127.0.0.1:3100',
        changeOrigin: false,
      },
      '/health': {
        target: 'http://127.0.0.1:3100',
        changeOrigin: false,
      },
    },
  },
});
