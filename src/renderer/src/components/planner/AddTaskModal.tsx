import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import type { PlannerTask, PlannerType, TaskCategory, TaskPriority } from '@/types/planner'
import { toYmd } from '@/lib/dateMath'

const CATEGORIES: TaskCategory[] = [
  'Study Goal',
  'Exams',
  'Bill Payment',
  'Internship',
  'Revision',
  'Mock Exam'
]

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']

export function AddTaskModal({
  open,
  onOpenChange,
  initial,
  onSave
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: PlannerTask | null
  onSave: (task: PlannerTask) => void
}): JSX.Element {
  const isEdit = !!initial
  const today = useMemo(() => toYmd(new Date()), [])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState(today)
  const [plannerType, setPlannerType] = useState<PlannerType>('weekly')
  const [category, setCategory] = useState<TaskCategory>('Study Goal')
  const [priority, setPriority] = useState<TaskPriority>('medium')

  useEffect(() => {
    if (!open) return
    if (initial) {
      setTitle(initial.title)
      setDescription(initial.description)
      setDueDate(initial.currentDueDate)
      setPlannerType(initial.plannerType)
      setCategory(initial.category)
      setPriority(initial.priority)
    } else {
      setTitle('')
      setDescription('')
      setDueDate(today)
      setPlannerType('weekly')
      setCategory('Study Goal')
      setPriority('medium')
    }
  }, [open, initial, today])

  const canSave = title.trim().length > 0

  const save = (): void => {
    if (!canSave) return
    const id = initial?.id ?? `t_${Math.random().toString(16).slice(2)}`
    const task: PlannerTask = {
      id,
      title: title.trim(),
      description,
      assignedDate: initial?.assignedDate ?? dueDate,
      originalDueDate: initial?.originalDueDate ?? dueDate,
      currentDueDate: dueDate,
      plannerType,
      category,
      priority,
      status: initial?.status ?? 'todo',
      reminderAt: initial?.reminderAt,
      timeLabel: initial?.timeLabel
    }
    onSave(task)
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-paper-200 bg-paper-50 shadow-card focus:outline-none'
          )}
        >
          <div className="flex items-center justify-between border-b border-paper-200 px-6 py-4">
            <div>
              <Dialog.Title className="font-display text-lg font-semibold text-ink-900">
                {isEdit ? 'Edit task' : 'Add task'}
              </Dialog.Title>
              <Dialog.Description className="text-xs text-ink-600">
                Weekly tasks: postpone ≤ 3 days. Monthly tasks: postpone ≤ 5 days.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/70 text-ink-700 ring-1 ring-paper-200 hover:bg-paper-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-ink-700">Title</label>
              <Input
                className="mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Exam FM revision — annuities"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-ink-700">Description</label>
              <TextArea
                className="mt-1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does good completion look like?"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-ink-700">Due date</label>
              <Input
                className="mt-1"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-700">Planner type</label>
              <select
                className="mt-1 w-full rounded-xl border border-paper-300 bg-paper-50 px-3 py-2 text-sm text-ink-900 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-400/30"
                value={plannerType}
                onChange={(e) => setPlannerType(e.target.value as PlannerType)}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-700">Category</label>
              <select
                className="mt-1 w-full rounded-xl border border-paper-300 bg-paper-50 px-3 py-2 text-sm text-ink-900 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-400/30"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-ink-700">Priority</label>
              <select
                className="mt-1 w-full rounded-xl border border-paper-300 bg-paper-50 px-3 py-2 text-sm text-ink-900 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-400/30"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-paper-200 px-6 py-4">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!canSave}>
              {isEdit ? 'Save changes' : 'Add task'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

