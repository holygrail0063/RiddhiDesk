import type { PlannerTask } from '@/types/planner'

const KEY = 'riddhidesk:planner-tasks:v1'

export function loadPlannerTasks(): PlannerTask[] | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { tasks?: PlannerTask[] }
    return Array.isArray(parsed.tasks) ? parsed.tasks : null
  } catch {
    return null
  }
}

export function savePlannerTasks(tasks: PlannerTask[]): void {
  localStorage.setItem(KEY, JSON.stringify({ tasks }))
}
