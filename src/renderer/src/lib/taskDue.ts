import type { PlannerTask } from '@/types/planner'

/** Default due time when no time label is set (9:00 AM local on due date). */
export function getTaskDueMoment(task: PlannerTask): Date {
  const ymd = task.currentDueDate
  const [y, m, d] = ymd.split('-').map(Number)
  const base = new Date(y, m - 1, d)
  const label = task.timeLabel?.trim()
  if (!label) {
    base.setHours(9, 0, 0, 0)
    return base
  }
  const match = label.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) {
    base.setHours(9, 0, 0, 0)
    return base
  }
  let h = parseInt(match[1], 10)
  const min = parseInt(match[2], 10)
  const ap = match[3].toUpperCase()
  if (ap === 'PM' && h !== 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  base.setHours(h, min, 0, 0)
  return base
}

export function formatDueBody(task: PlannerTask): string {
  const m = getTaskDueMoment(task)
  const today = new Date()
  const sameDay =
    m.getFullYear() === today.getFullYear() &&
    m.getMonth() === today.getMonth() &&
    m.getDate() === today.getDate()
  const timePart = task.timeLabel?.trim()
    ? `at ${task.timeLabel.trim()}`
    : 'at 9:00 AM'
  if (sameDay) {
    return `${task.title} is due today ${timePart}.`
  }
  return `${task.title} is due on ${task.currentDueDate} ${timePart}.`
}

export function formatOverdueBody(task: PlannerTask): string {
  return `${task.title} is overdue. Review or reschedule it.`
}
