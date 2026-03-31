import { useEffect, useRef } from 'react'
import type { PlannerTask } from '@/types/planner'
import { loadReminders, markReminderNotificationSent } from '@/lib/reminderStorage'
import { loadNotificationPrefs } from '@/lib/notificationPrefs'
import {
  isTaskDueSent,
  markTaskDueSent,
  isTaskOverdueSent,
  markTaskOverdueSent
} from '@/lib/notificationStateV2'
import { getTaskDueMoment, formatDueBody, formatOverdueBody } from '@/lib/taskDue'
import { pushMissedNotifications, type MissedItem } from '@/lib/missedNotifications'
import {
  ensureNotificationPermission,
  showDesktopNotification
} from '@/lib/notificationService'
import { useAuth } from '@/store/authContext'
import { usePlanner } from '@/store/plannerContext'

const INTERVAL_MS = 60_000
const DUE_GRACE_MS = 24 * 60 * 60 * 1000
const OVERDUE_DELAY_MS = 5 * 60 * 1000
const OVERDUE_GRACE_MS = 7 * 24 * 60 * 60 * 1000
const REMINDER_GRACE_MS = 24 * 60 * 60 * 1000
const MAX_PER_TICK = 3

type QueueItem = {
  sort: number
  lane: number
  title: string
  body: string
  tag: string
  action: { type: 'task' | 'reminder'; id: string }
  mark: () => void
}

function isIncomplete(t: PlannerTask): boolean {
  return t.status !== 'completed'
}

export function useDesktopPlannerReminders(): void {
  const { user, status } = useAuth()
  const { tasks } = usePlanner()
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks
  const permRef = useRef(false)

  useEffect(() => {
    if (status !== 'allowed' || !user) return

    void ensureNotificationPermission().then((ok) => {
      permRef.current = ok
    })

    const run = async (): Promise<void> => {
      const prefs = loadNotificationPrefs()
      const list = tasksRef.current
      const reminders = loadReminders()
      const now = Date.now()
      const queue: QueueItem[] = []
      const missedBatch: Omit<MissedItem, 'id'>[] = []

      if (prefs.dueDates) {
        for (const task of list) {
          if (!isIncomplete(task)) continue
          const dueMoment = getTaskDueMoment(task).getTime()
          if (now < dueMoment) continue
          if (isTaskDueSent(task.id, dueMoment)) continue

          const late = now - dueMoment
          if (late <= DUE_GRACE_MS) {
            queue.push({
              sort: dueMoment,
              lane: 0,
              title: 'Task due now',
              body: formatDueBody(task),
              tag: `task-due:${task.id}:${dueMoment}`,
              action: { type: 'task', id: task.id },
              mark: () => markTaskDueSent(task.id, dueMoment)
            })
          } else {
            markTaskDueSent(task.id, dueMoment)
            missedBatch.push({
              kind: 'task_due',
              refId: task.id,
              title: task.title,
              detail: `Was due ${new Date(dueMoment).toLocaleString()}`,
              at: new Date(dueMoment).toISOString()
            })
          }
        }
      }

      if (prefs.dueDates) {
        for (const task of list) {
          if (!isIncomplete(task)) continue
          const dueMoment = getTaskDueMoment(task).getTime()
          if (now < dueMoment + OVERDUE_DELAY_MS) continue
          if (isTaskOverdueSent(task.id, dueMoment)) continue

          const late = now - dueMoment
          if (!isTaskDueSent(task.id, dueMoment) && late <= DUE_GRACE_MS) {
            continue
          }

          if (late > OVERDUE_GRACE_MS) {
            markTaskOverdueSent(task.id, dueMoment)
            missedBatch.push({
              kind: 'task_overdue',
              refId: task.id,
              title: task.title,
              detail: 'Overdue — open the planner to review.',
              at: new Date(dueMoment).toISOString()
            })
            continue
          }

          queue.push({
            sort: dueMoment + OVERDUE_DELAY_MS,
            lane: 1,
            title: 'Task overdue',
            body: formatOverdueBody(task),
            tag: `task-overdue:${task.id}:${dueMoment}`,
            action: { type: 'task', id: task.id },
            mark: () => markTaskOverdueSent(task.id, dueMoment)
          })
        }
      }

      if (prefs.reminders) {
        for (const r of reminders) {
          if (r.status !== 'upcoming' || r.notificationSent) continue
          const atMs = new Date(r.at).getTime()
          if (Number.isNaN(atMs) || now < atMs) continue

          const late = now - atMs
          if (late > REMINDER_GRACE_MS) {
            markReminderNotificationSent(r.id)
            missedBatch.push({
              kind: 'reminder',
              refId: r.id,
              title: r.title,
              detail: r.description?.trim() || 'Scheduled reminder',
              at: r.at
            })
            continue
          }

          queue.push({
            sort: atMs,
            lane: 0,
            title: 'Reminder',
            body: r.description?.trim() || r.title,
            tag: `reminder:${r.id}`,
            action: { type: 'reminder', id: r.id },
            mark: () => markReminderNotificationSent(r.id)
          })
        }
      }

      if (missedBatch.length > 0) {
        pushMissedNotifications(missedBatch, 5)
      }

      queue.sort((a, b) => {
        if (a.sort !== b.sort) return a.sort - b.sort
        return a.lane - b.lane
      })

      const slice = queue.slice(0, MAX_PER_TICK)

      for (const item of slice) {
        if (!permRef.current) {
          const ok = await ensureNotificationPermission()
          permRef.current = ok
          if (!ok) break
        }
        const shown = await showDesktopNotification({
          title: item.title,
          body: item.body,
          tag: item.tag,
          action: item.action
        })
        if (shown) {
          item.mark()
        }
      }
    }

    void run()
    const id = window.setInterval(() => void run(), INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [user, status])
}
