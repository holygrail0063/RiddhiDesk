import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import {
  loadMissedNotifications,
  dismissMissedNotification,
  type MissedItem
} from '@/lib/missedNotifications'
import { cn } from '@/lib/cn'

function kindLabel(kind: MissedItem['kind']): string {
  switch (kind) {
    case 'task_due':
      return 'Missed due alert'
    case 'task_overdue':
      return 'Missed overdue alert'
    case 'reminder':
      return 'Missed reminder'
  }
}

export function MissedNotificationsBanner(): JSX.Element | null {
  const [items, setItems] = useState<MissedItem[]>(() => loadMissedNotifications())

  useEffect(() => {
    const h = (): void => setItems(loadMissedNotifications())
    window.addEventListener('riddhidesk:missed-updated', h)
    return () => window.removeEventListener('riddhidesk:missed-updated', h)
  }, [])

  if (items.length === 0) return null

  return (
    <div
      className="border-b border-amber-200/90 bg-gradient-to-r from-amber-50/95 to-paper-50 px-4 py-3 shadow-sm"
      role="region"
      aria-label="Missed notifications while the app was closed"
    >
      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-amber-900/80">
          While you were away
        </p>
        <ul className="space-y-2">
          {items.map((m) => (
            <li
              key={m.id}
              className={cn(
                'flex flex-wrap items-start justify-between gap-3 rounded-xl border border-amber-200/80 bg-white/80 px-3 py-2 text-sm'
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink-900">{m.title}</p>
                <p className="mt-0.5 text-xs text-ink-600">
                  <span className="text-ink-500">{kindLabel(m.kind)}:</span> {m.detail}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {m.kind === 'reminder' ? (
                  <Link
                    to="/reminders"
                    className="text-xs font-medium text-sage-700 underline-offset-2 hover:underline"
                    onClick={() => {
                      sessionStorage.setItem('riddhidesk:focusReminderId', m.refId)
                      window.dispatchEvent(new CustomEvent('riddhidesk:focus-reminder'))
                    }}
                  >
                    Open
                  </Link>
                ) : (
                  <Link
                    to="/planner"
                    className="text-xs font-medium text-sage-700 underline-offset-2 hover:underline"
                    onClick={() => {
                      sessionStorage.setItem('riddhidesk:focusTaskId', m.refId)
                      window.dispatchEvent(new CustomEvent('riddhidesk:focus-task'))
                    }}
                  >
                    Open in planner
                  </Link>
                )}
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-paper-100 hover:text-ink-800"
                  aria-label="Dismiss"
                  onClick={() => {
                    dismissMissedNotification(m.id)
                    setItems(loadMissedNotifications())
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
