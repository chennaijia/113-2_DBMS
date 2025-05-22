import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
   server: {
    proxy: {
      // 所有 /api 開頭的請求，轉發到後端
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,       // 修改 Host header
        secure: false,            // 如果是 https 就設成 false
        rewrite: (path) => path,  // 不改路徑，就直接 /api/xxx
      }
      }
    }
  })
