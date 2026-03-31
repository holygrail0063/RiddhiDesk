import { useEffect, useRef } from 'react'
import type { Deadline } from '@/types'
import { showDesktopNotification } from '@/lib/notificationService'
import { hasNotified, markNotified } from '@/lib/notificationDedupe'

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function useNotificationScheduler(
  uid: string | undefined,
  deadlines: Deadline[],
  prefs: { reminders: boolean; dueDates: boolean } | null
): void {
  const deadlinesRef = useRef(deadlines)
  const prefsRef = useRef(prefs)
  deadlinesRef.current = deadlines
  prefsRef.current = prefs

  useEffect(() => {
    if (!uid) return

    const tick = async () => {
      const list = deadlinesRef.current
      const p = prefsRef.current ?? { reminders: true, dueDates: true }
      const now = Date.now()

      for (const item of list) {
        if (item.completed) continue

        if (p.reminders && item.reminderAt) {
          const r = item.reminderAt.toMillis()
          if (r <= now) {
            const key = `reminder:${item.id}:${r}`
            if (!hasNotified(key)) {
              markNotified(key)
              await showDesktopNotification({
                title: item.title,
                body: `Reminder: ${item.description ? item.description.slice(0, 120) : 'See RiddhiDesk for details.'}`,
                tag: key
              })
            }
          }
        }

        if (p.dueDates) {
          const due = item.dueDate.toDate().getTime()
          if (due < now) {
            const key = `overdue:${item.id}:${ymd(new Date())}`
            if (!hasNotified(key)) {
              markNotified(key)
              await showDesktopNotification({
                title: item.title,
                body: 'This item is past its due date. Open RiddhiDesk to update or complete it.',
                tag: key
              })
            }
          }
        }
      }
    }

    void tick()
    const id = window.setInterval(() => {
      void tick()
    }, 60_000)

    return () => window.clearInterval(id)
  }, [uid])
}
