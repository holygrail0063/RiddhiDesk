import type { Reminder } from '@/types/reminder'

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function bucketReminders(reminders: Reminder[], now = new Date()): {
  today: Reminder[]
  upcoming: Reminder[]
  past: Reminder[]
} {
  const todayStr = ymd(now)
  const today: Reminder[] = []
  const upcoming: Reminder[] = []
  const past: Reminder[] = []

  for (const r of reminders) {
    const t = new Date(r.at)
    const ds = ymd(t)
    if (ds === todayStr) today.push(r)
    else if (ds > todayStr) upcoming.push(r)
    else past.push(r)
  }

  const byTime = (a: Reminder, b: Reminder) =>
    new Date(a.at).getTime() - new Date(b.at).getTime()

  today.sort(byTime)
  upcoming.sort(byTime)
  past.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  return { today, upcoming, past }
}
