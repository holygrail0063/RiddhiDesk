import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ReminderModal } from '@/components/reminders/ReminderModal'
import type { Reminder } from '@/types/reminder'
import { bucketReminders } from '@/lib/reminderBuckets'
import { loadReminders, saveReminders } from '@/lib/reminderStorage'

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  })
}

function statusBadge(r: Reminder): JSX.Element {
  if (r.status === 'completed') {
    return <Badge tone="sage">Completed</Badge>
  }
  return <Badge tone="neutral">Upcoming</Badge>
}

function Section({
  title,
  items,
  onToggle,
  onEdit,
  onDelete
}: {
  title: string
  items: Reminder[]
  onToggle: (id: string) => void
  onEdit: (r: Reminder) => void
  onDelete: (id: string) => void
}): JSX.Element {
  if (items.length === 0) {
    return (
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">{title}</h2>
        <p className="text-sm text-ink-500">No reminders.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">{title}</h2>
      <div className="space-y-2">
        {items.map((r) => (
          <Card key={r.id} id={`reminder-row-${r.id}`} className="p-4 scroll-mt-24">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium tabular-nums text-ink-500">
                    {timeLabel(r.at)}
                  </span>
                  <span className="font-medium text-ink-900">{r.title}</span>
                  <Badge tone="sage">{r.category || 'General'}</Badge>
                  {statusBadge(r)}
                </div>
                {r.description ? (
                  <p className="mt-2 text-sm text-ink-600">{r.description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="secondary"
                  className="px-2 py-1.5 text-xs"
                  onClick={() => onToggle(r.id)}
                >
                  {r.status === 'completed' ? 'Mark upcoming' : 'Done'}
                </Button>
                <Button
                  variant="secondary"
                  className="px-2 py-1.5 text-xs"
                  onClick={() => onEdit(r)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="danger"
                  className="px-2 py-1.5 text-xs"
                  onClick={() => onDelete(r.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function RemindersPage(): JSX.Element {
  const [items, setItems] = useState<Reminder[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Reminder | null>(null)

  useEffect(() => {
    setItems(loadReminders())
  }, [])

  useEffect(() => {
    const sync = (): void => setItems(loadReminders())
    window.addEventListener('riddhidesk:reminders-updated', sync)
    return () => window.removeEventListener('riddhidesk:reminders-updated', sync)
  }, [])

  useEffect(() => {
    const scrollTo = (): void => {
      const id = sessionStorage.getItem('riddhidesk:focusReminderId')
      if (!id) return
      sessionStorage.removeItem('riddhidesk:focusReminderId')
      requestAnimationFrame(() => {
        document.getElementById(`reminder-row-${id}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      })
    }
    scrollTo()
    window.addEventListener('riddhidesk:focus-reminder', scrollTo)
    return () => window.removeEventListener('riddhidesk:focus-reminder', scrollTo)
  }, [items])

  const persist = useCallback((next: Reminder[]) => {
    setItems(next)
    saveReminders(next)
  }, [])

  const grouped = useMemo(() => bucketReminders(items), [items])

  const toggle = (id: string) => {
    persist(
      items.map((r) =>
        r.id !== id
          ? r
          : { ...r, status: r.status === 'completed' ? 'upcoming' : 'completed' }
      )
    )
  }

  const remove = (id: string) => {
    persist(items.filter((r) => r.id !== id))
  }

  const saveReminder = (payload: Omit<Reminder, 'id'> & { id?: string }) => {
    if (payload.id) {
      persist(
        items.map((r) => {
          if (r.id !== payload.id) return r
          const atChanged = r.at !== payload.at
          return {
            ...r,
            title: payload.title,
            description: payload.description,
            at: payload.at,
            category: payload.category,
            status: payload.status,
            notificationSent: atChanged ? false : r.notificationSent,
            linkedTaskId: r.linkedTaskId
          }
        })
      )
    } else {
      const r: Reminder = {
        id: `r_${Math.random().toString(16).slice(2)}`,
        title: payload.title,
        description: payload.description,
        at: payload.at,
        category: payload.category,
        status: payload.status
      }
      persist([r, ...items])
    }
  }

  return (
    <div className="space-y-10 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Reminders</h1>
          <p className="mt-1 text-sm text-ink-600">
            Lightweight nudges outside your structured planner.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          New reminder
        </Button>
      </div>

      <div className="space-y-10">
        <Section
          title="Today"
          items={grouped.today}
          onToggle={toggle}
          onEdit={(r) => {
            setEditing(r)
            setModalOpen(true)
          }}
          onDelete={remove}
        />
        <Section
          title="Upcoming"
          items={grouped.upcoming}
          onToggle={toggle}
          onEdit={(r) => {
            setEditing(r)
            setModalOpen(true)
          }}
          onDelete={remove}
        />
        <Section
          title="Past"
          items={grouped.past}
          onToggle={toggle}
          onEdit={(r) => {
            setEditing(r)
            setModalOpen(true)
          }}
          onDelete={remove}
        />
      </div>

      <ReminderModal
        open={modalOpen}
        onOpenChange={(v) => {
          setModalOpen(v)
          if (!v) setEditing(null)
        }}
        initial={editing}
        onSave={saveReminder}
      />
    </div>
  )
}
