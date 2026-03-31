import { useMemo } from 'react'
import { usePlanner } from '@/store/plannerContext'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export function NeedsReplanPage(): JSX.Element {
  const { tasks, setSelectedTaskId } = usePlanner()

  const rows = useMemo(
    () => tasks.filter((t) => t.status === 'needs_replan'),
    [tasks]
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink-900">Needs replan</h1>
        <p className="mt-1 text-ink-600">
          Tasks that reached the postponement limit.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-600">Nothing needs replanning right now.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {rows.map((t) => (
            <Card key={t.id} className="border-amber-200 bg-amber-50/40">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-ink-900">{t.title}</p>
                    <Badge tone="warn">Needs replan</Badge>
                    <Badge tone="sage">{t.category}</Badge>
                    <Badge tone="neutral">{t.plannerType}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-ink-700 whitespace-pre-wrap">
                    {t.description}
                  </p>
                  <p className="mt-2 text-xs text-ink-600">
                    Original due {t.originalDueDate} • Current due {t.currentDueDate}
                  </p>
                  <p className="mt-2 text-xs text-amber-900/80">
                    This task has reached its postponement limit. Please move it into a new weekly or monthly plan.
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
                  Open details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

