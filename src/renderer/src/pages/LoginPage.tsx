import { Navigate } from 'react-router-dom'
import { RiddhiDeskLogin } from '@/components/auth/RiddhiDeskLogin'
import { useDemoAuth } from '@/store/demoAuth'

export function LoginPage(): JSX.Element {
  const { status, signInWithGoogle, error } = useDemoAuth()

  if (status === 'signed_in') {
    return <Navigate to="/planner" replace />
  }

  return (
    <RiddhiDeskLogin
      onGoogleSignIn={signInWithGoogle}
      loading={status === 'signing_in'}
      error={error}
    />
  )
}
