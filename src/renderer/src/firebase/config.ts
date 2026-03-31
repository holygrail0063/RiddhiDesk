import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
] as const

type FirebaseEnvKey = (typeof REQUIRED_KEYS)[number]

function normalizeEnvValue(value: unknown): string {
  const trimmed = String(value ?? '').trim()
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1).trim()
      : trimmed
  return unquoted
}

function isValidEnvValue(value: unknown): boolean {
  const normalized = normalizeEnvValue(value)
  return normalized !== '' && normalized.toLowerCase() !== 'undefined' && normalized.toLowerCase() !== 'null'
}

export function getEnvValue(key: FirebaseEnvKey | 'VITE_ALLOWED_EMAIL'): string {
  const value = import.meta.env[key]
  return isValidEnvValue(value) ? normalizeEnvValue(value) : ''
}

function maskApiKey(value: string): string {
  if (!value) return 'missing'
  if (value.length <= 6) return `${value.slice(0, 2)}***`
  return `${value.slice(0, 6)}***`
}

export function getMissingFirebaseEnvKeys(): string[] {
  return REQUIRED_KEYS.filter((key) => !getEnvValue(key))
}

const firebaseConfig = {
  apiKey: getEnvValue('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvValue('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvValue('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvValue('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvValue('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvValue('VITE_FIREBASE_APP_ID')
}

const firebaseEnvSummary = {
  runtime:
    typeof window !== 'undefined' && window.riddhiDesk ? 'electron-renderer' : 'web-renderer',
  apiKeyPresent: Boolean(getEnvValue('VITE_FIREBASE_API_KEY')),
  apiKeyMasked: maskApiKey(getEnvValue('VITE_FIREBASE_API_KEY')),
  authDomainPresent: Boolean(getEnvValue('VITE_FIREBASE_AUTH_DOMAIN')),
  projectIdPresent: Boolean(getEnvValue('VITE_FIREBASE_PROJECT_ID')),
  storageBucketPresent: Boolean(getEnvValue('VITE_FIREBASE_STORAGE_BUCKET')),
  messagingSenderIdPresent: Boolean(getEnvValue('VITE_FIREBASE_MESSAGING_SENDER_ID')),
  appIdPresent: Boolean(getEnvValue('VITE_FIREBASE_APP_ID')),
  allowedEmailPresent: Boolean(getEnvValue('VITE_ALLOWED_EMAIL'))
}

console.info('[Firebase config]', {
  runtime: firebaseEnvSummary.runtime,
  apiKeyPresent: firebaseEnvSummary.apiKeyPresent ? 'yes' : 'no',
  apiKeyMasked: firebaseEnvSummary.apiKeyMasked,
  apiKeyLength: getEnvValue('VITE_FIREBASE_API_KEY').length,
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
    throw new Error(`Missing or invalid Firebase config: ${missing.join(', ')}`)
  }
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  return app
}

export const auth = () => getAuth(getFirebaseApp())
export const db = () => getFirestore(getFirebaseApp())
