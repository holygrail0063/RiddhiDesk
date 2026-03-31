import { Timestamp } from 'firebase/firestore'

export function toDate(value: Timestamp | Date | null | undefined): Date | null {
  if (value == null) return null
  if (value instanceof Date) return value
  return value.toDate()
}

export function startOfWeek(d: Date): Date {
  const x = new Date(d)
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  x.setHours(0, 0, 0, 0)
  return x
}

export function endOfWeek(d: Date): Date {
  const s = startOfWeek(d)
  const e = new Date(s)
  e.setDate(e.getDate() + 7)
  e.setMilliseconds(e.getMilliseconds() - 1)
  return e
}

export function isOverdue(due: Timestamp | Date, completed: boolean): boolean {
  if (completed) return false
  const dt = due instanceof Date ? due : due.toDate()
  return dt.getTime() < Date.now()
}

export function formatShort(d: Date | Timestamp): string {
  const date = d instanceof Date ? d : d.toDate()
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatDateTime(d: Date | Timestamp): string {
  const date = d instanceof Date ? d : d.toDate()
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}
