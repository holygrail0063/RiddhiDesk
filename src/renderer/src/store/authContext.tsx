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
import { auth } from '@/firebase/config'
import { ensureProfile } from '@/services/profileService'
import { ensureSettings } from '@/services/settingsService'

const ALLOWED = (import.meta.env.VITE_ALLOWED_EMAIL || '').trim().toLowerCase()

type AuthStatus = 'loading' | 'signed_out' | 'allowed'

type AuthContextValue = {
  user: User | null
  status: AuthStatus
  accessDenied: boolean
  clearAccessDenied: () => void
  signInGoogle: () => Promise<void>
  signOutApp: () => Promise<void>
  allowedEmail: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    const a = auth()
    return onAuthStateChanged(a, async (next) => {
      if (!next) {
        setUser(null)
        setStatus('signed_out')
        return
      }
      const email = (next.email || '').toLowerCase()
      if (!ALLOWED || email !== ALLOWED) {
        setAccessDenied(true)
        setUser(null)
        setStatus('signed_out')
        await signOut(a)
        return
      }
      setAccessDenied(false)
      setUser(next)
      setStatus('allowed')
      try {
        await ensureProfile(next.uid, next.displayName, next.email)
        await ensureSettings(next.uid, ALLOWED)
      } catch {
        // Firestore errors surface in UI elsewhere
      }
    })
  }, [])

  const clearAccessDenied = useCallback(() => {
    setAccessDenied(false)
  }, [])

  const signInGoogle = useCallback(async () => {
    setAccessDenied(false)
    const a = auth()
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await signInWithPopup(a, provider)
  }, [])

  const signOutApp = useCallback(async () => {
    await signOut(auth())
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      accessDenied,
      clearAccessDenied,
      signInGoogle,
      signOutApp,
      allowedEmail: ALLOWED
    }),
    [user, status, accessDenied, clearAccessDenied, signInGoogle, signOutApp]
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
