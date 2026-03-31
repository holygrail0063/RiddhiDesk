import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const rendererEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_ALLOWED_EMAIL'
] as const

export default defineConfig(({ mode }) => {
  // Web builds read Vite env files directly from the repo root.
  // This is separate from Electron's config pipeline, so the web app
  // needs its own explicit env loading to avoid mismatches.
  const env = loadEnv(mode, path.resolve(__dirname, '.'), '')
  const rendererEnvDefine = Object.fromEntries(
    rendererEnvKeys.map((key) => [`import.meta.env.${key}`, JSON.stringify(env[key] ?? '')])
  )

  return {
    root: path.resolve(__dirname, 'src/renderer'),
    envDir: path.resolve(__dirname, '.'),
    define: rendererEnvDefine,
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
  }
})
