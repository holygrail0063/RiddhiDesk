import { useMemo, useState } from 'react'
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Pencil, Undo2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { usePlanner } from '@/store/plannerContext'
import type { PlannerTask } from '@/types/planner'
import { diffDays, fromYmd, isPast } from '@/lib/dateMath'
import { StatusBadge } from '@/components/planner/StatusBadge'

function labelDate(ymd: string): string {
  const d = fromYmd(ymd)
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function priorityTone(p: PlannerTask['priority']): 'neutral' | 'warn' | 'sage' | 'blush' {
  if (p === 'high') return 'warn'
  if (p === 'medium') return 'blush'
  return 'neutral'
}

export function TaskDetailsPanel(): JSX.Element {
  const { tasks, selectedTaskId, toggleComplete, postpone } = usePlanner()
  const [warning, setWarning] = useState<string | null>(null)

  const task = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  )

  const postponeInfo = useMemo(() => {
    if (!task) return null
    const limit = task.plannerType === 'weekly' ? 3 : 5
    const pushed = diffDays(task.currentDueDate, task.originalDueDate)
    const remaining = Math.max(0, limit - pushed)
    return { limit, pushed, remaining }
  }, [task])

  if (!task) {
    return (
      <aside className="w-[360px] shrink-0 border-l border-paper-200 bg-paper-50/70 p-5">
        <Card>
          <p className="text-sm text-ink-600">Select a task to see details.</p>
        </Card>
      </aside>
    )
  }

  const overdue = isPast(task.currentDueDate) && task.status !== 'completed'
  const dueChanged = task.currentDueDate !== task.originalDueDate

  return (
    <aside className="w-[360px] shrink-0 border-l border-paper-200 bg-paper-50/70 p-5">
      <div className="space-y-4">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink-500">Task</p>
              <h2 className="mt-1 truncate font-display text-xl font-semibold text-ink-900">
                {task.title}
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">
                {task.description || '—'}
              </p>
            </div>
            <StatusBadge task={task} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone="sage">{task.category}</Badge>
            <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>
            <Badge tone="neutral">{task.plannerType}</Badge>
            {overdue && <Badge tone="warn">Overdue</Badge>}
          </div>
        </Card>

        <Card>
          <p className="text-xs font-medium text-ink-500">Dates</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-ink-700">
                <CalendarDays className="h-4 w-4 text-ink-500" />
                Assigned
              </span>
              <span className="font-medium text-ink-900">{labelDate(task.assignedDate)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-ink-700">
                <Clock3 className="h-4 w-4 text-ink-500" />
                Original due
              </span>
              <span className="font-medium text-ink-900">{labelDate(task.originalDueDate)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-ink-700">
                <Clock3 className="h-4 w-4 text-ink-500" />
                Current due
              </span>
              <span className="font-medium text-ink-900">{labelDate(task.currentDueDate)}</span>
            </div>
            {dueChanged && (
              <p className="mt-2 text-xs text-ink-600">
                Postponed {postponeInfo?.pushed ?? 0} day(s) from the original due date.
              </p>
            )}
          </div>
        </Card>

        {task.status === 'needs_replan' && (
          <Card className="border-amber-200 bg-amber-50/70">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
              <div>
                <p className="text-sm font-medium text-amber-900">Needs replan</p>
                <p className="mt-1 text-xs text-amber-900/80">
                  This task has reached its postponement limit. Please move it into a new weekly or monthly plan.
                </p>
              </div>
            </div>
          </Card>
        )}

        {warning && (
          <Card className="border-amber-200 bg-amber-50/70">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
              <div>
                <p className="text-sm font-medium text-amber-900">Postpone blocked</p>
                <p className="mt-1 text-xs text-amber-900/80">{warning}</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid gap-2">
          <Button
            variant={task.status === 'completed' ? 'secondary' : 'primary'}
            onClick={() => toggleComplete(task.id)}
            className="w-full justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {task.status === 'completed' ? 'Mark as Todo' : 'Mark Complete'}
          </Button>

          <Button variant="secondary" className="w-full justify-center gap-2" onClick={() => alert('Edit UI coming next (demo).')}>
            <Pencil className="h-4 w-4" />
            Edit Task
          </Button>

          <Button
            variant="secondary"
            className="w-full justify-center gap-2"
            onClick={() => {
              setWarning(null)
              const res = postpone(task.id)
              if (!res.ok && res.warning) setWarning(res.warning)
            }}
          >
            <Undo2 className="h-4 w-4" />
            Postpone
          </Button>
        </div>

        {postponeInfo && (
          <p className="text-xs text-ink-500">
            Rule: {task.plannerType} tasks can be postponed up to {postponeInfo.limit} day(s) beyond the original due date.
            {task.status !== 'needs_replan' && (
              <> You have {postponeInfo.remaining} postponement day(s) remaining.</>
            )}
          </p>
        )}
      </div>
    </aside>
  )
}

