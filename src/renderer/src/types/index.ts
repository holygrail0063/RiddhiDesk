import type { Timestamp } from 'firebase/firestore'

export type NoteCategory =
  | 'Exams'
  | 'Fees'
  | 'Study Goals'
  | 'Personal Plans'
  | 'Internship Plans'
  | 'Other'

export type PlanCategory =
  | 'Long-term goals'
  | 'Exam roadmap'
  | 'Internships'
  | 'Certifications'
  | 'Personal milestones'

export type PlanStatus = 'planned' | 'in_progress' | 'done' | 'on_hold'

export type DeadlinePriority = 'low' | 'medium' | 'high'

export interface Note {
  id: string
  title: string
  content: string
  category: NoteCategory
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface NoteInput {
  title: string
  content: string
  category: NoteCategory
}

export interface Deadline {
  id: string
  title: string
  description: string
  category: string
  dueDate: Timestamp
  reminderAt: Timestamp | null
  priority: DeadlinePriority
  completed: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface DeadlineInput {
  title: string
  description: string
  category: string
  dueDate: Date
  reminderAt: Date | null
  priority: DeadlinePriority
  completed: boolean
}

export interface Plan {
  id: string
  title: string
  description: string
  targetDate: Timestamp | null
  status: PlanStatus
  category: PlanCategory
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface PlanInput {
  title: string
  description: string
  targetDate: Date | null
  status: PlanStatus
  category: PlanCategory
}

export interface UserProfile {
  displayName: string | null
  email: string | null
  createdAt: Timestamp
}

export interface AppSettings {
  allowedEmail: string
  notificationPreferences: {
    reminders: boolean
    dueDates: boolean
  }
  theme: 'light' | 'dark'
}

export interface DashboardSnapshot {
  upcomingDeadlines: Deadline[]
  upcomingExams: Deadline[]
  weekGoals: Deadline[]
  overdue: Deadline[]
  milestones: Plan[]
}
