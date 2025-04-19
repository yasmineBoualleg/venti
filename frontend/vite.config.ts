import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
    host: '127.0.0.1',
    open: true, // Automatically open the browser
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',  // Django's default port
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
