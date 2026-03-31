import { Navigate } from 'react-router-dom'
import { useAuth } from '@/store/authContext'

export function ProtectedRoute({ children }: { children: JSX.Element }): JSX.Element {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-paper-50">
        <p className="text-sm text-ink-600">Loading…</p>
      </div>
    )
  }

  if (status !== 'allowed') {
    return <Navigate to="/login" replace />
  }

  return children
}
