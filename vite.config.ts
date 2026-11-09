import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Khi chạy dev, chuyển tiếp REST và Socket.IO tới backend Express cục bộ
    // để trình duyệt chỉ cần một origin duy nhất (tránh CORS khi test).
    proxy: {
      '/api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/socket.io': { target: 'http://127.0.0.1:4000', ws: true, changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    // Chuẩn bị cho Capacitor: dùng đường dẫn tương đối để nhúng vào WebView.
    assetsDir: 'assets',
    sourcemap: false,
  },
});
