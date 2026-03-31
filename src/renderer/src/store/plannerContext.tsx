import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import type { PlannerTask } from '@/types/planner'
import { demoTasks } from '@/data/demoTasks'
import { addDaysYmd, diffDays, isPast } from '@/lib/dateMath'
import { loadPlannerTasks, savePlannerTasks } from '@/lib/plannerStorage'

type ViewMode = 'monthly' | 'weekly' | 'scribble'

type PlannerContextValue = {
  tasks: PlannerTask[]
  selectedTaskId: string | null
  viewMode: ViewMode
  query: string
  setQuery: (q: string) => void
  setViewMode: (m: ViewMode) => void
  setSelectedTaskId: (id: string | null) => void
  toggleComplete: (id: string) => void
  upsertTask: (t: PlannerTask) => void
  postpone: (id: string) => { ok: boolean; warning?: string }
}

const PlannerContext = createContext<PlannerContextValue | null>(null)

function computeNeedsReplan(t: PlannerTask): boolean {
  const limit = t.plannerType === 'weekly' ? 3 : 5
  const pushed = diffDays(t.currentDueDate, t.originalDueDate)
  return pushed > limit
}

export function PlannerProvider({ children }: { children: ReactNode }): JSX.Element {
  const [tasks, setTasks] = useState<PlannerTask[]>(() => {
    const saved = loadPlannerTasks()
    if (saved !== null) return saved
    return demoTasks
  })
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(() => {
    const saved = loadPlannerTasks()
    const seed = saved !== null ? saved : demoTasks
    return seed[0]?.id ?? null
  })

  useEffect(() => {
    savePlannerTasks(tasks)
  }, [tasks])
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')
  const [query, setQuery] = useState('')

  const toggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id !== id
          ? t
          : {
              ...t,
              status: t.status === 'completed' ? 'todo' : 'completed'
            }
      )
    )
  }

  const upsertTask = (t: PlannerTask) => {
    setTasks((prev) => {
      const idx = prev.findIndex((x) => x.id === t.id)
      if (idx === -1) return [t, ...prev]
      const next = [...prev]
      next[idx] = t
      return next
    })
  }

  const postpone = (id: string): { ok: boolean; warning?: string } => {
    const warning =
      'This task has reached its postponement limit. Please move it into a new weekly or monthly plan.'
    let did = false
    let blocked = false

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        if (t.status === 'completed') return t

        const limit = t.plannerType === 'weekly' ? 3 : 5
        const pushed = diffDays(t.currentDueDate, t.originalDueDate)

        if (pushed >= limit) {
          blocked = true
          return {
            ...t,
            status: 'needs_replan'
          }
        }

        did = true
        const nextDue = addDaysYmd(t.currentDueDate, 1)
        const needs = diffDays(nextDue, t.originalDueDate) > limit
        return {
          ...t,
          currentDueDate: nextDue,
          status: needs ? 'needs_replan' : t.status
        }
      })
    )

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
      viewMode,
      query,
      setQuery,
      setViewMode,
      setSelectedTaskId,
      toggleComplete,
      upsertTask,
      postpone
    }),
    [normalized, selectedTaskId, viewMode, query]
  )

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
}

export function usePlanner(): PlannerContextValue {
  const ctx = useContext(PlannerContext)
  if (!ctx) throw new Error('usePlanner must be used within PlannerProvider')
  return ctx
}

