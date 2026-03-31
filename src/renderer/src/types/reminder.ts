export type ReminderStatus = 'upcoming' | 'completed'

export type Reminder = {
  id: string
  title: string
  description: string
  at: string // ISO
  category: string
  status: ReminderStatus
  /** When true, one-time desktop notification for `at` has been sent. */
  notificationSent?: boolean
  /** Optional link to a planner task for navigation. */
  linkedTaskId?: string
}
