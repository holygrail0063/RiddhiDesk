export type NotificationPrefs = {
  reminders: boolean
  dueDates: boolean
}

const KEY = 'riddhidesk:demo:settings'

export function loadNotificationPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { reminders: true, dueDates: true }
    const s = JSON.parse(raw) as { reminders?: boolean; dueDates?: boolean }
    return {
      reminders: typeof s.reminders === 'boolean' ? s.reminders : true,
      dueDates: typeof s.dueDates === 'boolean' ? s.dueDates : true
    }
  } catch {
    return { reminders: true, dueDates: true }
  }
}
