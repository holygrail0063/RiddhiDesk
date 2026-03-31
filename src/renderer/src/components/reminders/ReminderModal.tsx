import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import type { Reminder } from '@/types/reminder'
import { cn } from '@/lib/cn'

function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function ReminderModal({
  open,
  onOpenChange,
  initial,
  onSave
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial: Reminder | null
  onSave: (r: Omit<Reminder, 'id'> & { id?: string }) => void
}): JSX.Element {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [atLocal, setAtLocal] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    if (!open) return
    if (initial) {
      setTitle(initial.title)
      setDescription(initial.description)
      setAtLocal(toLocalInput(initial.at))
      setCategory(initial.category)
    } else {
      setTitle('')
      setDescription('')
      const d = new Date()
      d.setMinutes(d.getMinutes() - (d.getMinutes() % 15) + 15, 0, 0)
      setAtLocal(toLocalInput(d.toISOString()))
      setCategory('')
    }
  }, [open, initial])

  const save = (): void => {
    const t = title.trim()
    if (!t || !atLocal) return
    const at = new Date(atLocal).toISOString()
    onSave({
      id: initial?.id,
      title: t,
      description: description.trim(),
      at,
      category: category.trim() || 'General',
      status: initial?.status ?? 'upcoming'
    })
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-paper-200 bg-paper-50 shadow-card focus:outline-none'
          )}
        >
          <div className="flex items-center justify-between border-b border-paper-200 px-5 py-4">
            <Dialog.Title className="font-display text-lg font-semibold text-ink-900">
              {initial ? 'Edit reminder' : 'New reminder'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/80 ring-1 ring-paper-200 hover:bg-paper-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="space-y-4 px-5 py-5">
            <div>
              <label className="text-xs font-medium text-ink-700">Title</label>
              <Input
                className="mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What should we remind you about?"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-700">Date &amp; time</label>
              <Input
                className="mt-1"
                type="datetime-local"
                value={atLocal}
                onChange={(e) => setAtLocal(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-700">Description (optional)</label>
              <TextArea
                className="mt-1 min-h-[88px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Extra context"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-700">Category (optional)</label>
              <Input
                className="mt-1"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Exam, Bill, Personal"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-paper-200 px-5 py-4">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!title.trim() || !atLocal}>
              {initial ? 'Save' : 'Add reminder'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
