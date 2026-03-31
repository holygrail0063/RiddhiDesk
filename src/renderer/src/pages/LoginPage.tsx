import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { RiddhiDeskLogin } from '@/components/auth/RiddhiDeskLogin'
import { useAuth } from '@/store/authContext'

export function LoginPage(): JSX.Element {
  const {
    status,
    signInGoogle,
    accessDenied,
    clearAccessDenied,
    authError,
    authInfo,
    clearAuthError
  } = useAuth()
  const [busy, setBusy] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-paper-50">
        <p className="text-sm text-ink-600">Loading…</p>
      </div>
    )
  }

  if (status === 'allowed') {
    return <Navigate to="/planner" replace />
  }

  const onGoogle = async (): Promise<void> => {
    setSignInError(null)
    clearAccessDenied()
    clearAuthError()
    setBusy(true)
    try {
      await signInGoogle()
    } catch (e) {
      setSignInError(e instanceof Error ? e.message : 'Sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  const errorMessage = accessDenied
    ? 'This account is not authorized. Please contact Akash for access.'
    : authError || signInError

  return (
    <RiddhiDeskLogin
      onGoogleSignIn={onGoogle}
      loading={busy}
      info={authInfo}
      error={errorMessage}
    />
  )
}
