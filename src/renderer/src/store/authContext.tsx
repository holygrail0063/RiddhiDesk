import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
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
import { getAuthRuntime, type AuthRuntime } from '@/lib/authRuntime'
import {
  allowedEmails,
  getUnauthorizedEmailMessage,
  isAllowedEmail,
  primaryAllowedEmail
} from '@/lib/authPolicy'
import { ensureProfile } from '@/services/profileService'
import { ensureSettings } from '@/services/settingsService'
const MISSING_KEYS = getMissingFirebaseEnvKeys()

type AuthStatus = 'loading' | 'signed_out' | 'allowed'

type AuthContextValue = {
  user: User | null
  status: AuthStatus
  accessDenied: boolean
  runtime: AuthRuntime
  authError: string | null
  authInfo: string | null
  clearAccessDenied: () => void
  clearAuthError: () => void
  signInGoogle: () => Promise<void>
  signOutApp: () => Promise<void>
  allowedEmail: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapAuthError(error: unknown, runtime: AuthRuntime): string {
  if (error instanceof Error && error.message.startsWith('Missing or invalid Firebase config:')) {
    return 'Firebase config is invalid or missing. Check local env values and restart the app.'
  }
  if (runtime === 'electron' && error instanceof Error) {
    if (error.message.includes('GOOGLE_DESKTOP_CLIENT_ID')) {
      return 'Desktop Google sign-in is not configured. Add GOOGLE_DESKTOP_CLIENT_ID and restart Electron.'
    }
    return 'Google sign-in failed. Please try again.'
  }
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
  if (code) {
    if (code.includes('auth/api-key-not-valid')) {
      return 'Firebase config is invalid or missing. Check local env values and restart the app.'
    }
    switch (code) {
      case 'auth/popup-blocked':
        return 'Google sign-in failed. Please try again.'
      case 'auth/popup-closed-by-user':
        return 'Google sign-in failed. Please try again.'
      case 'auth/unauthorized-domain':
        return 'Google sign-in failed. Please try again.'
      case 'auth/invalid-api-key':
        return 'Firebase config is invalid or missing. Check local env values and restart the app.'
      case 'auth/internal-error':
        return 'Google sign-in failed. Please try again.'
      default:
        return 'Google sign-in failed. Please try again.'
    }
  }
  return 'Google sign-in failed. Please try again.'
}

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const runtime = getAuthRuntime()
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [accessDenied, setAccessDenied] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authInfo, setAuthInfo] = useState<string | null>(null)

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
        setAuthInfo(null)
        setStatus('signed_out')
        return
      }
      if (!isAllowedEmail(next.email)) {
        console.warn('Unauthorized login attempt:', next.email)
        setAccessDenied(true)
        setAuthError(getUnauthorizedEmailMessage())
        setUser(null)
        setStatus('signed_out')
        await signOut(a)
        return
      }
      setAccessDenied(false)
      setAuthError(null)
      setAuthInfo(null)
      setUser(next)
      setStatus('allowed')
      try {
        await ensureProfile(next.uid, next.displayName, next.email)
        await ensureSettings(next.uid, primaryAllowedEmail)
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
    setAuthInfo(null)
    if (MISSING_KEYS.length > 0) {
      throw new Error(`Missing or invalid Firebase config: ${MISSING_KEYS.join(', ')}`)
    }
    if (runtime === 'electron') {
      if (!window.riddhiDesk?.startDesktopGoogleSignIn) {
        const msg = 'Desktop Google sign-in is unavailable in this build. Restart the app after rebuilding Electron.'
        setAuthError(msg)
        throw new Error(msg)
      }
      setAuthInfo('Waiting for Google sign-in in your browser. Finish the browser step to return to RiddhiDesk.')
      try {
        const result = await window.riddhiDesk.startDesktopGoogleSignIn()
        const a = auth()
        const credential = GoogleAuthProvider.credential(result.idToken, result.accessToken)
        await signInWithCredential(a, credential)
        return
      } catch (e) {
        setAuthInfo(null)
        const msg = mapAuthError(e, runtime)
        setAuthError(msg)
        throw new Error(msg)
      }
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
      authInfo,
      clearAccessDenied,
      clearAuthError,
      signInGoogle,
      signOutApp,
      allowedEmail: primaryAllowedEmail
    }),
    [
      user,
      status,
      accessDenied,
      runtime,
      authError,
      authInfo,
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
