import dotenv from 'dotenv'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import path from 'path'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env', override: false })

const rendererEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_ALLOWED_EMAIL',
  'GOOGLE_DESKTOP_CLIENT_ID'
] as const

const rendererEnvDefine = Object.fromEntries(
  rendererEnvKeys.map((key) => [
    `import.meta.env.${key}`,
    JSON.stringify(process.env[key] ?? '')
  ])
)

const mainEnvDefine = {
  __GOOGLE_DESKTOP_CLIENT_ID__: JSON.stringify(process.env.GOOGLE_DESKTOP_CLIENT_ID ?? ''),
  __GOOGLE_DESKTOP_CLIENT_SECRET__: JSON.stringify(process.env.GOOGLE_DESKTOP_CLIENT_SECRET ?? '')
}

export default defineConfig({
  main: {
    define: mainEnvDefine,
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    define: rendererEnvDefine,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
