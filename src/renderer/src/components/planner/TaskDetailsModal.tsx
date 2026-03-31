import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Pencil, Undo2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import type { PlannerTask } from '@/types/planner'
import { addDaysYmd, diffDays, fromYmd, isPast } from '@/lib/dateMath'
import { StatusBadge } from '@/components/planner/StatusBadge'

function labelDate(ymd: string): string {
  return fromYmd(ymd).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

export function TaskDetailsModal({
  open,
  onOpenChange,
  task,
  onToggleComplete,
  onPostpone,
  onEdit
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  task: PlannerTask | null
  onToggleComplete: (id: string) => void
  onPostpone: (id: string) => { ok: boolean; warning?: string }
  onEdit: (task: PlannerTask) => void
}): JSX.Element {
  if (!task) return <></>

  const limit = task.plannerType === 'weekly' ? 3 : 5
  const pushed = diffDays(task.currentDueDate, task.originalDueDate)
  const remaining = Math.max(0, limit - pushed)
  const maxAllowed = addDaysYmd(task.originalDueDate, limit)
  const overdue = isPast(task.currentDueDate) && task.status !== 'completed'

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-[560px] max-w-[92vw] border-l border-paper-200 bg-paper-50 p-6 shadow-card focus:outline-none">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="font-display text-2xl font-semibold text-ink-900">
                Task details
              </Dialog.Title>
              <Dialog.Description className="text-sm text-ink-600">
                Weekly view is best for execution; monthly is overview.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/80 ring-1 ring-paper-200 hover:bg-paper-100"
              >
                <X className="h-5 w-5 text-ink-700" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4 overflow-y-auto pb-4">
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-semibold text-ink-900">{task.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">{task.description}</p>
                </div>
                <StatusBadge task={task} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge tone="sage">{task.category}</Badge>
                <Badge tone="neutral">{task.priority}</Badge>
                <Badge tone="neutral">{task.plannerType}</Badge>
                {overdue && <Badge tone="warn">Overdue</Badge>}
              </div>
            </Card>

            <Card>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-ink-700">
                    <CalendarDays className="h-4 w-4 text-ink-500" />
                    Assigned date
                  </span>
                  <span className="font-medium text-ink-900">{labelDate(task.assignedDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-ink-700">
                    <Clock3 className="h-4 w-4 text-ink-500" />
                    Original due date
                  </span>
                  <span className="font-medium text-ink-900">{labelDate(task.originalDueDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-ink-700">
                    <Clock3 className="h-4 w-4 text-ink-500" />
                    Current due date
                  </span>
                  <span className="font-medium text-ink-900">{labelDate(task.currentDueDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-700">Max allowed postpone date</span>
                  <span className="font-medium text-ink-900">{labelDate(maxAllowed)}</span>
                </div>
              </div>
            </Card>

            {task.status === 'needs_replan' && (
              <Card className="border-amber-200 bg-amber-50/70">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
                  <p className="text-sm text-amber-900">
                    This task has reached its postponement limit. Please move it into a new weekly or monthly plan.
                  </p>
                </div>
              </Card>
            )}

            <Card className="border-paper-200 bg-white/80">
              <p className="text-xs text-ink-600">
                Rule: {task.plannerType} tasks can be postponed up to {limit} day(s) beyond original due date.
                {task.status !== 'needs_replan' && <> Remaining: {remaining} day(s).</>}
              </p>
            </Card>

            <div className="grid gap-2">
              <Button
                variant={task.status === 'completed' ? 'secondary' : 'primary'}
                onClick={() => onToggleComplete(task.id)}
                className="w-full justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {task.status === 'completed' ? 'Mark as Todo' : 'Mark Complete'}
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-center gap-2"
                onClick={() => onEdit(task)}
              >
                <Pencil className="h-4 w-4" />
                Edit Task
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-center gap-2"
                onClick={() => {
                  const res = onPostpone(task.id)
                  if (!res.ok && res.warning) {
                    alert(res.warning)
                  }
                }}
              >
                <Undo2 className="h-4 w-4" />
                Postpone
              </Button>
            </div>
          </div>

          <Dialog.Close
            className={cn(
              'absolute inset-y-0 left-0 hidden w-0.5 bg-paper-200 lg:block'
            )}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

