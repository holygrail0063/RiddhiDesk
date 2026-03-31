import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { fromYmd } from '@/lib/dateMath'
import type { PlannerTask } from '@/types/planner'
import { TaskPill } from '@/components/planner/TaskPill'

export function DayTasksModal({
  open,
  onOpenChange,
  dateKey,
  tasks,
  selectedTaskId,
  onSelectTask,
  onToggleTask
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  dateKey: string | null
  tasks: PlannerTask[]
  selectedTaskId: string | null
  onSelectTask: (id: string) => void
  onToggleTask: (id: string) => void
}): JSX.Element {
  const label = dateKey
    ? fromYmd(dateKey).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : ''

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[min(92vw,880px)] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-paper-200 bg-paper-50 p-5 shadow-card focus:outline-none sm:max-w-[calc(100vw-2rem)] sm:p-6 lg:w-[min(88vw,960px)] lg:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-xl font-semibold text-ink-900 sm:text-2xl">
                {label || 'Day tasks'}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-ink-600">
                Monthly view stays lightweight. Use weekly view to execute tasks.
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

          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-paper-200 bg-paper-100/50 px-4 py-8 text-center text-sm text-ink-600">
              No tasks on this date.
            </div>
          ) : (
            <div className="max-h-[min(68vh,720px)] space-y-3 overflow-y-auto pr-1 sm:pr-2">
              {tasks.map((t) => (
                <TaskPill
                  key={t.id}
                  task={t}
                  selected={selectedTaskId === t.id}
                  onSelect={() => onSelectTask(t.id)}
                  onToggle={() => onToggleTask(t.id)}
                />
              ))}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

