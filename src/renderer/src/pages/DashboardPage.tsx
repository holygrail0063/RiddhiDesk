import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { usePlanner } from '@/store/plannerContext'
import { isPast } from '@/lib/dateMath'

export function DashboardPage(): JSX.Element {
  const { tasks } = usePlanner()

  const snap = useMemo(() => {
    const active = tasks.filter((t) => t.status !== 'completed')
    const overdue = active.filter((t) => isPast(t.currentDueDate) && t.status !== 'completed')
    const needsReplan = tasks.filter((t) => t.status === 'needs_replan')
    const completed = tasks.filter((t) => t.status === 'completed')
    const dueSoon = active
      .filter((t) => !isPast(t.currentDueDate))
      .sort((a, b) => a.currentDueDate.localeCompare(b.currentDueDate))
      .slice(0, 6)
    return { active, overdue, needsReplan, completed, dueSoon }
  }, [tasks])

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink-900">Dashboard</h1>
        <p className="mt-1 text-ink-600">A calm snapshot of your study plan.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs font-medium text-ink-500">Active</p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink-900">
            {snap.active.length}
          </p>
        </Card>
        <Card className={snap.overdue.length ? 'border-red-200 bg-red-50/40' : ''}>
          <p className="text-xs font-medium text-ink-500">Overdue</p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink-900">
            {snap.overdue.length}
          </p>
        </Card>
        <Card className={snap.needsReplan.length ? 'border-amber-200 bg-amber-50/40' : ''}>
          <p className="text-xs font-medium text-ink-500">Needs replan</p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink-900">
            {snap.needsReplan.length}
          </p>
        </Card>
        <Card className={snap.completed.length ? 'border-emerald-200 bg-emerald-50/40' : ''}>
          <p className="text-xs font-medium text-ink-500">Completed</p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink-900">
            {snap.completed.length}
          </p>
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Due soon</h2>
          <Badge tone="neutral">next 6</Badge>
        </div>
        {snap.dueSoon.length === 0 ? (
          <p className="text-sm text-ink-500">Nothing due soon.</p>
        ) : (
          <ul className="space-y-2">
            {snap.dueSoon.map((t) => (
              <li
                key={t.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-paper-200 bg-paper-50/80 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-ink-900">{t.title}</p>
                  <p className="text-xs text-ink-500">
                    Due {t.currentDueDate} • {t.category}
                  </p>
                </div>
                {t.status === 'needs_replan' && <Badge tone="warn">Needs replan</Badge>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
