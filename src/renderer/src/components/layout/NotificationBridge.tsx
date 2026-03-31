import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlanner } from '@/store/plannerContext'
import type { NotificationAction } from '@/lib/notificationService'

/**
 * Routes Electron / web notification clicks into the SPA (planner task or reminders).
 */
export function NotificationBridge(): null {
  const navigate = useNavigate()
  const { setSelectedTaskId } = usePlanner()

  useEffect(() => {
    const route = (action: NotificationAction): void => {
      if (action.type === 'task') {
        void navigate('/planner')
        setSelectedTaskId(action.id)
      } else {
        sessionStorage.setItem('riddhidesk:focusReminderId', action.id)
        void navigate('/reminders')
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent('riddhidesk:focus-reminder'))
        })
      }
    }

    const unsub = window.riddhiDesk?.onNotificationClick?.(route)
    const onWeb = (e: Event): void => {
      const ce = e as CustomEvent<NotificationAction>
      if (ce.detail) route(ce.detail)
    }
    window.addEventListener('riddhidesk:notification-action', onWeb)
    return () => {
      unsub?.()
      window.removeEventListener('riddhidesk:notification-action', onWeb)
    }
  }, [navigate, setSelectedTaskId])

  return null
}
