import { useMemo, useState } from 'react'
import { usePlanner } from '@/store/plannerContext'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { isPast } from '@/lib/dateMath'

export function TasksPage(): JSX.Element {
  const { tasks, setSelectedTaskId } = usePlanner()
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    const list = tasks
      .filter((x) => x.status !== 'completed')
      .filter((x) =>
        !t
          ? true
          : x.title.toLowerCase().includes(t) ||
            x.description.toLowerCase().includes(t) ||
            x.category.toLowerCase().includes(t)
      )
    list.sort((a, b) => a.currentDueDate.localeCompare(b.currentDueDate))
    return list
  }, [tasks, q])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink-900">Tasks</h1>
        <p className="mt-1 text-ink-600">Active tasks across your planner.</p>
      </div>
      <Input
        className="max-w-md"
        placeholder="Search tasks…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {rows.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-600">No matching tasks.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {rows.map((t) => {
            const overdue = isPast(t.currentDueDate) && t.status !== 'completed'
            return (
              <Card
                key={t.id}
                className={overdue ? 'border-red-200 bg-red-50/40' : ''}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink-900">{t.title}</p>
                      {t.status === 'needs_replan' && <Badge tone="warn">Needs replan</Badge>}
                      {overdue && <Badge tone="warn">Overdue</Badge>}
                      <Badge tone="sage">{t.category}</Badge>
                      <Badge tone="neutral">{t.priority}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-ink-700 whitespace-pre-wrap">
                      {t.description}
                    </p>
                    <p className="mt-2 text-xs text-ink-500">
                      Assigned {t.assignedDate} • Due {t.currentDueDate} • {t.plannerType}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    className="text-xs py-2"
                    onClick={() => {
                      setSelectedTaskId(t.id)
                      location.hash = '#/planner'
                    }}
                  >
                    View in planner
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

