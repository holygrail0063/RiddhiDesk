import type { Deadline, Plan } from '@/types'
import { endOfWeek, isOverdue, startOfWeek } from '@/lib/dates'

export function buildDashboard(deadlinesOnly: Deadline[], plans: Plan[]): {
  upcomingDeadlines: Deadline[]
  upcomingExams: Deadline[]
  weekGoals: Deadline[]
  overdue: Deadline[]
  milestones: Plan[]
} {
  const d = deadlinesOnly
  const now = new Date()
  const sow = startOfWeek(now)
  const eow = endOfWeek(now)

  const overdue = d.filter((x) => isOverdue(x.dueDate, x.completed))

  const upcoming = d
    .filter((x) => !x.completed && x.dueDate.toDate() >= now)
    .sort((a, b) => a.dueDate.toMillis() - b.dueDate.toMillis())
    .slice(0, 8)

  const upcomingExams = d
    .filter(
      (x) =>
        !x.completed &&
        (x.category.toLowerCase().includes('exam') || x.category === 'Exams')
    )
    .sort((a, b) => a.dueDate.toMillis() - b.dueDate.toMillis())
    .slice(0, 6)

  const weekGoals = d.filter((x) => {
    if (x.completed) return false
    const dt = x.dueDate.toDate()
    return dt >= sow && dt <= eow
  })

  const milestones = plans
    .filter((p) => p.status !== 'done' && p.targetDate)
    .sort((a, b) => {
      const am = a.targetDate?.toMillis() ?? 0
      const bm = b.targetDate?.toMillis() ?? 0
      return am - bm
    })
    .slice(0, 6)

  return {
    upcomingDeadlines: upcoming,
    upcomingExams,
    weekGoals,
    overdue,
    milestones
  }
}
