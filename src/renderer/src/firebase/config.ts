import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
] as const

export function getMissingFirebaseEnvKeys(): string[] {
  const env = import.meta.env
  return REQUIRED_KEYS.filter((k) => !String(env[k] || '').trim())
}

let app: FirebaseApp | null = null

export function getFirebaseApp(): FirebaseApp {
  const missing = getMissingFirebaseEnvKeys()
  if (missing.length > 0) {
    throw new Error(`Missing Firebase config: ${missing.join(', ')}`)
  }
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  return app
}

export const auth = () => getAuth(getFirebaseApp())
export const db = () => getFirestore(getFirebaseApp())
