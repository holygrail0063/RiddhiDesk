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

function isPresentEnvValue(value: unknown): boolean {
  const normalized = String(value ?? '').trim()
  return normalized !== '' && normalized.toLowerCase() !== 'undefined' && normalized.toLowerCase() !== 'null'
}

function maskApiKey(value: string): string {
  if (!value) return 'missing'
  if (value.length <= 8) return `${value.slice(0, 2)}***`
  return `${value.slice(0, 4)}***${value.slice(-4)}`
}

export function getMissingFirebaseEnvKeys(): string[] {
  const env = import.meta.env
  return REQUIRED_KEYS.filter((k) => !isPresentEnvValue(env[k]))
}

const firebaseEnvSummary = {
  runtime:
    typeof window !== 'undefined' && window.riddhiDesk ? 'electron-renderer' : 'web-renderer',
  apiKeyPresent: isPresentEnvValue(import.meta.env.VITE_FIREBASE_API_KEY),
  apiKeyMasked: maskApiKey(String(import.meta.env.VITE_FIREBASE_API_KEY || '')),
  authDomainPresent: isPresentEnvValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectIdPresent: isPresentEnvValue(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucketPresent: isPresentEnvValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderIdPresent: isPresentEnvValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appIdPresent: isPresentEnvValue(import.meta.env.VITE_FIREBASE_APP_ID),
  allowedEmailPresent: isPresentEnvValue(import.meta.env.VITE_ALLOWED_EMAIL)
}

console.info('[Firebase config]', {
  runtime: firebaseEnvSummary.runtime,
  apiKeyPresent: firebaseEnvSummary.apiKeyPresent ? 'yes' : 'no',
  apiKeyMasked: firebaseEnvSummary.apiKeyMasked,
  authDomainPresent: firebaseEnvSummary.authDomainPresent ? 'yes' : 'no',
  projectIdPresent: firebaseEnvSummary.projectIdPresent ? 'yes' : 'no',
  storageBucketPresent: firebaseEnvSummary.storageBucketPresent ? 'yes' : 'no',
  messagingSenderIdPresent: firebaseEnvSummary.messagingSenderIdPresent ? 'yes' : 'no',
  appIdPresent: firebaseEnvSummary.appIdPresent ? 'yes' : 'no',
  allowedEmailPresent: firebaseEnvSummary.allowedEmailPresent ? 'yes' : 'no',
  missingKeys: getMissingFirebaseEnvKeys()
})

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
