import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { NotificationBridge } from '@/components/layout/NotificationBridge'
import { MissedNotificationsBanner } from '@/components/layout/MissedNotificationsBanner'
import { useDesktopPlannerReminders } from '@/hooks/useDesktopPlannerReminders'

export function MainLayout(): JSX.Element {
  useDesktopPlannerReminders()

  return (
    <div className="flex h-screen w-screen min-h-0 min-w-0 overflow-hidden bg-paper-50">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppHeader />
        <MissedNotificationsBanner />
        <NotificationBridge />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-[1920px] flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
