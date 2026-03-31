import { useMemo, useState } from 'react'
import { useAuth } from '@/store/authContext'
import { useAppData } from '@/store/appDataContext'
import {
  createDeadline,
  deleteDeadline,
  updateDeadline
} from '@/services/deadlinesService'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { Deadline, DeadlinePriority } from '@/types'
import { formatDateTime, isOverdue } from '@/lib/dates'

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInput(s: string): Date {
  return new Date(s)
}

export function DeadlinesPage(): JSX.Element {
  const { user } = useAuth()
  const { deadlines, loading, error } = useAppData()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Deadline | null>(null)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [dueLocal, setDueLocal] = useState(toLocalInput(new Date()))
  const [reminderLocal, setReminderLocal] = useState('')
  const [priority, setPriority] = useState<DeadlinePriority>('medium')
  const [completed, setCompleted] = useState(false)

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    return deadlines.filter((d) => {
      if (!t) return true
      return (
        d.title.toLowerCase().includes(t) ||
        d.description.toLowerCase().includes(t) ||
        d.category.toLowerCase().includes(t)
      )
    })
  }, [deadlines, q])

  const resetForm = (): void => {
    setTitle('')
    setDescription('')
    setCategory('General')
    setDueLocal(toLocalInput(new Date()))
    setReminderLocal('')
    setPriority('medium')
    setCompleted(false)
    setEditing(null)
    setCreating(false)
  }

  const openNew = (): void => {
    resetForm()
    setCreating(true)
  }

  const openEdit = (d: Deadline): void => {
    setCreating(false)
    setEditing(d)
    setTitle(d.title)
    setDescription(d.description)
    setCategory(d.category)
    setDueLocal(toLocalInput(d.dueDate.toDate()))
    setReminderLocal(d.reminderAt ? toLocalInput(d.reminderAt.toDate()) : '')
    setPriority(d.priority)
    setCompleted(d.completed)
  }

  const save = async (): Promise<void> => {
    if (!user || !title.trim()) return
    const payload = {
      title: title.trim(),
      description,
      category,
      dueDate: fromLocalInput(dueLocal),
      reminderAt: reminderLocal ? fromLocalInput(reminderLocal) : null,
      priority,
      completed
    }
    if (editing) {
      await updateDeadline(user.uid, editing.id, payload)
    } else {
      await createDeadline(user.uid, payload)
    }
    resetForm()
  }

  const remove = async (id: string): Promise<void> => {
    if (!user) return
    if (!confirm('Delete this deadline?')) return
    await deleteDeadline(user.uid, id)
    if (editing?.id === id) resetForm()
  }

  if (loading) return <p className="text-sm text-ink-600">Loading deadlines…</p>
  if (error) return <p className="text-sm text-red-700">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">
            Deadlines / Dues
          </h1>
          <p className="mt-1 text-ink-600">Fees, registrations, and dated study targets.</p>
        </div>
        <Button onClick={openNew}>Add deadline</Button>
      </div>

      <Input
        placeholder="Search…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-md"
      />

      {(creating || editing) && (
        <Card>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
            {editing ? 'Edit deadline' : 'New deadline'}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-ink-600">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-ink-600">Description</label>
              <TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-600">Category</label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-600">Priority</label>
              <select
                className="mt-1 w-full rounded-xl border border-paper-300 bg-paper-50 px-3 py-2 text-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value as DeadlinePriority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-600">Due</label>
              <Input
                type="datetime-local"
                value={dueLocal}
                onChange={(e) => setDueLocal(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-600">Reminder (optional)</label>
              <Input
                type="datetime-local"
                value={reminderLocal}
                onChange={(e) => setReminderLocal(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input
                id="completed"
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
              <label htmlFor="completed" className="text-sm text-ink-700">
                Completed
              </label>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button onClick={() => void save()}>Save</Button>
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-500">No deadlines match your search.</p>
          </Card>
        ) : (
          filtered.map((d) => {
            const overdue = isOverdue(d.dueDate, d.completed)
            return (
              <Card
                key={d.id}
                className={overdue ? 'border-red-200 bg-red-50/50' : ''}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-ink-900">{d.title}</h3>
                      {overdue && <Badge tone="warn">Overdue</Badge>}
                      <Badge tone="neutral">{d.priority}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-500">{d.category}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">
                      {d.description || '—'}
                    </p>
                    <p className="mt-2 text-sm text-ink-800">
                      Due: <span className="font-medium">{formatDateTime(d.dueDate)}</span>
                    </p>
                    {d.reminderAt && (
                      <p className="text-xs text-ink-600">
                        Reminder: {formatDateTime(d.reminderAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="text-xs py-1.5" onClick={() => openEdit(d)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="text-xs py-1.5"
                      onClick={() => void remove(d.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
