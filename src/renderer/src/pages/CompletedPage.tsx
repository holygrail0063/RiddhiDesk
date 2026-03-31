import { useMemo } from 'react'
import { usePlanner } from '@/store/plannerContext'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export function CompletedPage(): JSX.Element {
  const { tasks, loading, error } = usePlanner()

  const done = useMemo(
    () => tasks.filter((t) => t.status === 'completed'),
    [tasks]
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink-900">Completed</h1>
        <p className="mt-1 text-ink-600">A tidy archive of what you finished.</p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50/40">
          <p className="text-sm text-red-900">{error}</p>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <p className="text-sm text-ink-500">Loading completed tasks…</p>
        </Card>
      ) : null}

      {!loading && done.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-600">Nothing completed yet.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {done.map((t) => (
            <Card key={t.id} className="bg-emerald-50/35 border-emerald-200">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-ink-900 line-through opacity-80">
                  {t.title}
                </p>
                <Badge tone="sage">{t.category}</Badge>
                <Badge tone="neutral">{t.priority}</Badge>
              </div>
              <p className="mt-2 text-xs text-ink-500">
                Assigned {t.assignedDate} • Due {t.currentDueDate}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

