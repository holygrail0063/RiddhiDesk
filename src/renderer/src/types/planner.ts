export type PlannerType = 'weekly' | 'monthly'
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'completed' | 'needs_replan'

export type TaskCategory =
  | 'Study Goal'
  | 'Exams'
  | 'Bill Payment'
  | 'Internship'
  | 'Revision'
  | 'Mock Exam'

export type PlannerTask = {
  id: string
  title: string
  description: string
  assignedDate: string // YYYY-MM-DD
  originalDueDate: string // YYYY-MM-DD
  currentDueDate: string // YYYY-MM-DD
  plannerType: PlannerType
  category: TaskCategory
  priority: TaskPriority
  status: TaskStatus
  reminderAt?: string // ISO local string
  timeLabel?: string // "7:30 PM"
  dueNotificationSent?: boolean
  overdueNotificationSent?: boolean
}

