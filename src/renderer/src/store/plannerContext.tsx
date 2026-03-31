import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import type { PlannerTask } from '@/types/planner'
import { addDaysYmd, diffDays, isPast } from '@/lib/dateMath'
import { useAuth } from '@/store/authContext'
import {
  subscribeTasks,
  upsertTask as saveTaskDoc,
  updateTask as updateTaskDoc,
  deleteTask as deleteTaskDoc
} from '@/services/firestore/tasks'

type ViewMode = 'monthly' | 'weekly' | 'scribble'

type PlannerContextValue = {
  tasks: PlannerTask[]
  selectedTaskId: string | null
  loading: boolean
  error: string | null
  viewMode: ViewMode
  query: string
  setQuery: (q: string) => void
  setViewMode: (m: ViewMode) => void
  setSelectedTaskId: (id: string | null) => void
  toggleComplete: (id: string) => void
  upsertTask: (t: PlannerTask) => void
  postpone: (id: string) => { ok: boolean; warning?: string }
  deleteTask: (id: string) => void
}

const PlannerContext = createContext<PlannerContextValue | null>(null)

function computeNeedsReplan(t: PlannerTask): boolean {
  const limit = t.plannerType === 'weekly' ? 3 : 5
  const pushed = diffDays(t.currentDueDate, t.originalDueDate)
  return pushed > limit
}

export function PlannerProvider({ children }: { children: ReactNode }): JSX.Element {
  const { user, status } = useAuth()
  const [tasks, setTasks] = useState<PlannerTask[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (status !== 'allowed' || !user) {
      setTasks([])
      setSelectedTaskId(null)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    const unsub = subscribeTasks(user.uid, (items) => {
      setTasks(items)
      setSelectedTaskId((current) => {
        if (current && items.some((task) => task.id === current)) return current
        return items[0]?.id ?? null
      })
      setLoading(false)
    })

    return () => unsub()
  }, [user, status])

  const toggleComplete = (id: string) => {
    if (!user) return
    const task = tasks.find((item) => item.id === id)
    if (!task) return
    void updateTaskDoc(user.uid, id, {
      status: task.status === 'completed' ? 'todo' : 'completed'
    }).catch((e) => setError(e instanceof Error ? e.message : 'Failed to update task'))
  }

  const upsertTask = (t: PlannerTask) => {
    if (!user) return
    const existing = tasks.find((item) => item.id === t.id)
    const dueChanged =
      !existing ||
      existing.currentDueDate !== t.currentDueDate ||
      existing.timeLabel !== t.timeLabel
    void saveTaskDoc(user.uid, {
      ...t,
      dueNotificationSent: dueChanged ? false : t.dueNotificationSent ?? existing?.dueNotificationSent,
      overdueNotificationSent:
        dueChanged ? false : t.overdueNotificationSent ?? existing?.overdueNotificationSent
    }).catch((e) => setError(e instanceof Error ? e.message : 'Failed to save task'))
  }

  const deleteTask = (id: string) => {
    if (!user) return
    void deleteTaskDoc(user.uid, id).catch((e) =>
      setError(e instanceof Error ? e.message : 'Failed to delete task')
    )
  }

  const postpone = (id: string): { ok: boolean; warning?: string } => {
    const warning =
      'This task has reached its postponement limit. Please move it into a new weekly or monthly plan.'
    let did = false
    let blocked = false

    const task = tasks.find((t) => t.id === id)
    if (!task || task.status === 'completed') return { ok: false }

    const limit = task.plannerType === 'weekly' ? 3 : 5
    const pushed = diffDays(task.currentDueDate, task.originalDueDate)

    if (pushed >= limit) {
      blocked = true
      if (user) {
        void updateTaskDoc(user.uid, id, { status: 'needs_replan' }).catch((e) =>
          setError(e instanceof Error ? e.message : 'Failed to update task')
        )
      }
    } else {
      did = true
      const nextDue = addDaysYmd(task.currentDueDate, 1)
      const needs = diffDays(nextDue, task.originalDueDate) > limit
      if (user) {
        void updateTaskDoc(user.uid, id, {
          currentDueDate: nextDue,
          status: needs ? 'needs_replan' : task.status
        }).catch((e) => setError(e instanceof Error ? e.message : 'Failed to update task'))
      }
    }

    if (blocked) return { ok: false, warning }
    if (!did) return { ok: false }
    return { ok: true }
  }

  // keep "needs_replan" sticky if it's beyond limit
  const normalized = useMemo(() => {
    return tasks.map((t) => {
      const needs = computeNeedsReplan(t)
      const overdue = isPast(t.currentDueDate) && t.status !== 'completed'
      const status: PlannerTask['status'] =
        t.status === 'completed'
          ? 'completed'
          : needs
            ? 'needs_replan'
            : t.status
      return overdue && status === 'todo' ? { ...t, status } : { ...t, status }
    })
  }, [tasks])

  const value = useMemo(
    () => ({
      tasks: normalized,
      selectedTaskId,
      loading,
      error,
      viewMode,
      query,
      setQuery,
      setViewMode,
      setSelectedTaskId,
      toggleComplete,
      upsertTask,
      postpone,
      deleteTask
    }),
    [normalized, selectedTaskId, loading, error, viewMode, query]
  )

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
}

export function usePlanner(): PlannerContextValue {
  const ctx = useContext(PlannerContext)
  if (!ctx) throw new Error('usePlanner must be used within PlannerProvider')
  return ctx
}

