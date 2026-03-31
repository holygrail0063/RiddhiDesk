import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname, 'src/renderer'),
  // Standard Vite env loading for the web app reads `.env` / `.env.local`
  // from the repo root. After changing those files, fully restart `npm run dev:web`.
  envDir: path.resolve(__dirname, '.'),
  build: {
    outDir: path.resolve(__dirname, 'dist/web'),
    emptyOutDir: true,
    sourcemap: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer/src')
    }
  },
  plugins: [react()]
})
