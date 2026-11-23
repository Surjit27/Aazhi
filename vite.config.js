import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // *.localhost in dev
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
      '/ai-worker': {
        target: 'http://127.0.0.1:4100',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-worker/, ''),
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
      '/ai-worker': {
        target: 'http://127.0.0.1:4100',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-worker/, ''),
      },
    },
  },
})
