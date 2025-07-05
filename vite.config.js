import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    // Ensure we're using HTTP for local development
    https: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Prevent 'ws' from being bundled for the browser
      'ws': path.resolve(__dirname, 'src/lib/empty-module.js')
    }
  },
  build: {
    rollupOptions: {
      external: ['ws']
    }
  }
})