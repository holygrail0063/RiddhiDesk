import type { Reminder } from '@/types/reminder'

const KEY = 'riddhidesk:reminders:v1'

export function loadReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { reminders?: Reminder[] }
    return Array.isArray(parsed.reminders) ? parsed.reminders : []
  } catch {
    return []
  }
}

export function saveReminders(reminders: Reminder[]): void {
  localStorage.setItem(KEY, JSON.stringify({ reminders }))
  window.dispatchEvent(new CustomEvent('riddhidesk:reminders-updated'))
}

export function markReminderNotificationSent(reminderId: string): void {
  const list = loadReminders()
  const next = list.map((r) =>
    r.id === reminderId ? { ...r, notificationSent: true } : r
  )
  saveReminders(next)
}
