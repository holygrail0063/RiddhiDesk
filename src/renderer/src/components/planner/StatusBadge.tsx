import { cn } from '@/lib/cn'
import type { PlannerTask } from '@/types/planner'

export function StatusBadge({ task }: { task: PlannerTask }): JSX.Element | null {
  if (task.status === 'todo') return null

  const map = {
    completed: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
    needs_replan: 'bg-amber-100 text-amber-900 ring-amber-200'
  } as const

  const label = task.status === 'completed' ? 'Completed' : 'Needs replan'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
        map[task.status]
      )}
    >
      {label}
    </span>
  )
}

