import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type DemoUser = {
  displayName: string
  email: string
}

type DemoAuthContextValue = {
  user: DemoUser | null
  status: 'signed_out' | 'signing_in' | 'signed_in'
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => void
}

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null)

export function DemoAuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<DemoUser | null>(null)
  const [status, setStatus] = useState<DemoAuthContextValue['status']>('signed_out')
  const [error, setError] = useState<string | null>(null)

  const signInWithGoogle = async (): Promise<void> => {
    setError(null)
    setStatus('signing_in')
    try {
      // Placeholder: replace with Firebase Google Sign-In (popup) later.
      await new Promise((r) => setTimeout(r, 900))
      setUser({
        displayName: 'Riddhi',
        email: 'riddhi@example.com'
      })
      setStatus('signed_in')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed')
      setStatus('signed_out')
    }
  }

  const signOut = (): void => {
    setUser(null)
    setError(null)
    setStatus('signed_out')
  }

  const value = useMemo(
    () => ({ user, status, error, signInWithGoogle, signOut }),
    [user, status, error]
  )

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>
}

export function useDemoAuth(): DemoAuthContextValue {
  const ctx = useContext(DemoAuthContext)
  if (!ctx) throw new Error('useDemoAuth must be used within DemoAuthProvider')
  return ctx
}

