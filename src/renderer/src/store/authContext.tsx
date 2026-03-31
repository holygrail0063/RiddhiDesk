import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User
} from 'firebase/auth'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import { auth, getMissingFirebaseEnvKeys } from '@/firebase/config'
import { ensureProfile } from '@/services/profileService'
import { ensureSettings } from '@/services/settingsService'

const AKASH_ALLOWED_EMAIL = 'akashkamble0063@gmail.com'
const ENV_ALLOWED_EMAIL = (import.meta.env.VITE_ALLOWED_EMAIL || '').trim().toLowerCase()
const ALLOWED_EMAILS = Array.from(
  new Set([ENV_ALLOWED_EMAIL, AKASH_ALLOWED_EMAIL].map((x) => x.trim().toLowerCase()).filter(Boolean))
)
const PRIMARY_ALLOWED_EMAIL = ENV_ALLOWED_EMAIL || AKASH_ALLOWED_EMAIL
const MISSING_KEYS = getMissingFirebaseEnvKeys()

type AuthStatus = 'loading' | 'signed_out' | 'allowed'
type AuthRuntime = 'web' | 'electron'

type AuthContextValue = {
  user: User | null
  status: AuthStatus
  accessDenied: boolean
  runtime: AuthRuntime
  authError: string | null
  clearAccessDenied: () => void
  clearAuthError: () => void
  signInGoogle: () => Promise<void>
  signOutApp: () => Promise<void>
  allowedEmail: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

function detectRuntime(): AuthRuntime {
  return window.riddhiDesk ? 'electron' : 'web'
}

function isAllowedEmail(email: string | null | undefined): boolean {
  const normalized = (email || '').trim().toLowerCase()
  if (!normalized) return false
  return ALLOWED_EMAILS.includes(normalized)
}

function mapAuthError(error: unknown, runtime: AuthRuntime): string {
  if (runtime === 'electron') {
    return 'Google sign-in is currently available in the web version. Electron auth flow needs system-browser sign-in.'
  }
  if (error instanceof Error && error.message.startsWith('Missing Firebase config:')) {
    return `${error.message}. Add these as VITE_* variables and redeploy.`
  }
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
  if (code) {
    switch (code) {
      case 'auth/popup-blocked':
        return 'Popup was blocked by the browser. Allow popups for this site and try again.'
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed before completion. Please try again.'
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized in Firebase. Add the deployed domain under Firebase Auth > Authorized domains.'
      case 'auth/invalid-api-key':
        return 'Firebase API key is invalid. Verify your VITE_FIREBASE_API_KEY setting.'
      case 'auth/internal-error':
        return 'Firebase sign-in encountered an internal error. Check Firebase Auth settings and authorized domains.'
      default:
        return `Firebase sign-in failed (${code}).`
    }
  }
  return error instanceof Error ? error.message : 'Sign-in failed. Please try again.'
}

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const runtime = detectRuntime()
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [accessDenied, setAccessDenied] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (MISSING_KEYS.length > 0) {
      setAuthError(`Missing Firebase config: ${MISSING_KEYS.join(', ')}`)
      setStatus('signed_out')
      return
    }
    const a = auth()
    return onAuthStateChanged(a, async (next) => {
      if (!next) {
        setUser(null)
        setStatus('signed_out')
        return
      }
      if (!isAllowedEmail(next.email)) {
        setAccessDenied(true)
        setAuthError(
          `This account is not allowed. Use ${ALLOWED_EMAILS.join(' or ')}.`
        )
        setUser(null)
        setStatus('signed_out')
        await signOut(a)
        return
      }
      setAccessDenied(false)
      setAuthError(null)
      setUser(next)
      setStatus('allowed')
      try {
        await ensureProfile(next.uid, next.displayName, next.email)
        await ensureSettings(next.uid, PRIMARY_ALLOWED_EMAIL)
      } catch {
        // Firestore errors surface in UI elsewhere
      }
    })
  }, [])

  const clearAccessDenied = useCallback(() => {
    setAccessDenied(false)
  }, [])

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  const signInGoogle = useCallback(async () => {
    setAccessDenied(false)
    setAuthError(null)
    if (MISSING_KEYS.length > 0) {
      throw new Error(`Missing Firebase config: ${MISSING_KEYS.join(', ')}`)
    }
    if (runtime === 'electron') {
      throw new Error(
        'Google sign-in is currently available in the web version. Electron auth flow needs system-browser sign-in.'
      )
    }
    const a = auth()
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    try {
      await signInWithPopup(a, provider)
    } catch (e) {
      const msg = mapAuthError(e, runtime)
      setAuthError(msg)
      throw new Error(msg)
    }
  }, [runtime])

  const signOutApp = useCallback(async () => {
    await signOut(auth())
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      accessDenied,
      runtime,
      authError,
      clearAccessDenied,
      clearAuthError,
      signInGoogle,
      signOutApp,
      allowedEmail: PRIMARY_ALLOWED_EMAIL
    }),
    [
      user,
      status,
      accessDenied,
      runtime,
      authError,
      clearAccessDenied,
      clearAuthError,
      signInGoogle,
      signOutApp
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
