import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAuth } from '@/store/authContext'
import { Button } from '@/components/ui/Button'

export function MainLayout(): JSX.Element {
  const { user, signOutApp } = useAuth()

  return (
    <div className="flex h-screen overflow-hidden bg-paper-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-paper-200 bg-paper-50/90 px-8 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">Signed in</p>
            <p className="text-sm font-medium text-ink-900">{user?.email}</p>
          </div>
          <Button variant="secondary" onClick={() => void signOutApp()}>
            Sign out
          </Button>
        </header>
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
