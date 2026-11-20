import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0', // Lắng nghe trên mọi interface LAN (192.168.1.60, localhost, 127.0.0.1)
    port: 5173,
    strictPort: true,
    allowedHosts: true, // Cho phép ngrok (*.ngrok-free.dev, *.ngrok.app), LAN và mọi hostname
    proxy: {
      // Chỉ proxy API (/api/v1/...), không proxy file tĩnh frontend /api.js
      '^/api/': {
        target: 'http://127.0.0.1:3100',
        changeOrigin: false,
      },
      // Proxy toàn bộ luồng OAuth SSO Lark (/auth/lark/login, /auth/lark/callback, /auth/logout)
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
