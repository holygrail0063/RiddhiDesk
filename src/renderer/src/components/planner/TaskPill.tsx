import { cn } from '@/lib/cn'
import type { PlannerTask } from '@/types/planner'
import { isPast, diffDays } from '@/lib/dateMath'
import { Check } from 'lucide-react'

function tint(task: PlannerTask): string {
  if (task.status === 'completed') return 'bg-emerald-100/80 text-emerald-900 ring-emerald-200'
  if (task.status === 'needs_replan') return 'bg-amber-100/90 text-amber-900 ring-amber-200'

  const overdue = isPast(task.currentDueDate)
  const daysToDue = diffDays(task.currentDueDate, new Date().toISOString().slice(0, 10))
  if (overdue) return 'bg-red-100/80 text-red-900 ring-red-200'
  if (daysToDue >= 0 && daysToDue <= 2) return 'bg-amber-100/80 text-amber-950 ring-amber-200'

  const cat = task.category
  if (cat === 'Study Goal') return 'bg-sky-100/80 text-sky-900 ring-sky-200'
  if (cat === 'Exams' || cat === 'Bill Payment') return 'bg-violet-100/80 text-violet-950 ring-violet-200'
  if (cat === 'Mock Exam') return 'bg-purple-100/80 text-purple-950 ring-purple-200'
  return 'bg-paper-200/80 text-ink-900 ring-paper-300'
}

export function TaskPill({
  task,
  selected,
  onToggle,
  onSelect
}: {
  task: PlannerTask
  selected: boolean
  onToggle: () => void
  onSelect: () => void
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group flex w-full items-start gap-2 rounded-xl px-2 py-1.5 text-left text-xs ring-1 transition hover:shadow-soft',
        tint(task),
        selected && 'ring-2 ring-sage-500/60'
      )}
    >
      <span
        className={cn(
          'mt-[2px] grid h-4 w-4 shrink-0 place-items-center rounded-md ring-1 ring-ink-900/10 bg-white/65',
          task.status === 'completed' && 'bg-emerald-600 text-white ring-emerald-700/30'
        )}
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        role="checkbox"
        aria-checked={task.status === 'completed'}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            e.stopPropagation()
            onToggle()
          }
        }}
      >
        {task.status === 'completed' && <Check className="h-3.5 w-3.5" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn('truncate font-medium', task.status === 'completed' && 'line-through opacity-70')}>
            {task.title}
          </p>
          {task.timeLabel && (
            <span className="shrink-0 text-[10px] opacity-70">{task.timeLabel}</span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="rounded-full bg-white/55 px-2 py-0.5 text-[10px] ring-1 ring-white/60">
            {task.category}
          </span>
          {task.status === 'needs_replan' && (
            <span className="text-[10px] font-medium">replan</span>
          )}
        </div>
      </div>
    </button>
  )
}

