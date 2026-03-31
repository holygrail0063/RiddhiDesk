import { useMemo } from 'react'
import { useAppData } from '@/store/appDataContext'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatShort, isOverdue } from '@/lib/dates'

type Row = {
  id: string
  kind: 'deadline' | 'plan'
  title: string
  date: Date
  detail: string
  overdue?: boolean
}

export function CalendarPage(): JSX.Element {
  const { deadlines, plans, loading, error } = useAppData()

  const rows = useMemo(() => {
    const out: Row[] = []
    for (const d of deadlines) {
      out.push({
        id: `d-${d.id}`,
        kind: 'deadline',
        title: d.title,
        date: d.dueDate.toDate(),
        detail: d.category,
        overdue: isOverdue(d.dueDate, d.completed)
      })
    }
    for (const p of plans) {
      if (!p.targetDate) continue
      out.push({
        id: `p-${p.id}`,
        kind: 'plan',
        title: p.title,
        date: p.targetDate.toDate(),
        detail: p.category
      })
    }
    out.sort((a, b) => a.date.getTime() - b.date.getTime())
    return out
  }, [deadlines, plans])

  const grouped = useMemo(() => {
    const map = new Map<string, Row[]>()
    for (const r of rows) {
      const key = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}`
      const list = map.get(key) ?? []
      list.push(r)
      map.set(key, list)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [rows])

  if (loading) return <p className="text-sm text-ink-600">Loading timeline…</p>
  if (error) return <p className="text-sm text-red-700">{error}</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink-900">Calendar / Timeline</h1>
        <p className="mt-1 text-ink-600">
          Upcoming deadlines and dated plans, grouped by month.
        </p>
      </div>

      {grouped.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-500">
            No dated items yet. Add deadlines or plans with target dates.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {grouped.map(([monthKey, list]) => {
            const [y, m] = monthKey.split('-').map(Number)
            const label = new Date(y, m - 1, 1).toLocaleString(undefined, {
              month: 'long',
              year: 'numeric'
            })
            return (
              <section key={monthKey}>
                <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">{label}</h2>
                <div className="space-y-3 border-l-2 border-sage-400/40 pl-4">
                  {list.map((r) => (
                    <Card
                      key={r.id}
                      className={r.overdue ? 'border-red-200 bg-red-50/50' : ''}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={r.kind === 'deadline' ? 'blush' : 'sage'}>
                          {r.kind === 'deadline' ? 'Deadline' : 'Plan'}
                        </Badge>
                        {r.overdue && <Badge tone="warn">Overdue</Badge>}
                        <span className="text-xs text-ink-500">{formatShort(r.date)}</span>
                      </div>
                      <p className="mt-2 font-medium text-ink-900">{r.title}</p>
                      <p className="text-xs text-ink-600">{r.detail}</p>
                    </Card>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
