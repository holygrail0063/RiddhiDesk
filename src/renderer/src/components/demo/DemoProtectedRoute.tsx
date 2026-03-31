import { Navigate } from 'react-router-dom'
import { useDemoAuth } from '@/store/demoAuth'

export function DemoProtectedRoute({
  children
}: {
  children: JSX.Element
}): JSX.Element {
  const { status } = useDemoAuth()

  if (status === 'signing_in') {
    return (
      <div className="flex h-screen items-center justify-center bg-paper-50">
        <p className="text-sm text-ink-600">Signing you in…</p>
      </div>
    )
  }

  if (status !== 'signed_in') {
    return <Navigate to="/login" replace />
  }

  return children
}

