import { Navigate } from 'react-router-dom'
import { useAuth } from '@/store/authContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function LoginPage(): JSX.Element {
  const { status, signInGoogle, accessDenied, clearAccessDenied, allowedEmail } = useAuth()

  if (status === 'allowed') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-paper-100 via-paper-50 to-sage-400/20 px-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-semibold text-ink-900">RiddhiDesk</h1>
          <p className="mt-2 text-sm text-ink-600">
            Private study planner — sign in with Google to continue.
          </p>
        </div>

        {accessDenied && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          >
            <p className="font-medium">Access denied</p>
            <p className="mt-1">
              Only <span className="font-mono">{allowedEmail || '(configure VITE_ALLOWED_EMAIL)'}</span>{' '}
              may use this app. You have been signed out.
            </p>
            <button
              type="button"
              className="mt-2 text-xs font-medium text-red-800 underline"
              onClick={clearAccessDenied}
            >
              Dismiss
            </button>
          </div>
        )}

        <Button
          className="w-full gap-2"
          onClick={() => void signInGoogle()}
          disabled={status === 'loading'}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        {status === 'loading' && (
          <p className="mt-4 text-center text-xs text-ink-500">Restoring session…</p>
        )}
      </Card>
    </div>
  )
}
