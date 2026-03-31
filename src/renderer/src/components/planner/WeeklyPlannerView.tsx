import { useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { addDaysYmd, fromYmd, isPast, toYmd } from '@/lib/dateMath'
import type { PlannerTask } from '@/types/planner'
import { usePlanner } from '@/store/plannerContext'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function startOfWeek(d: Date): Date {
  const out = new Date(d)
  out.setHours(12, 0, 0, 0)
  out.setDate(d.getDate() - d.getDay())
  return out
}

function endOfWeek(d: Date): Date {
  const out = startOfWeek(d)
  out.setDate(out.getDate() + 6)
  return out
}

function rowStatus(task: PlannerTask): JSX.Element {
  if (task.status === 'completed') return <Badge tone="sage">Completed</Badge>
  if (task.status === 'needs_replan') return <Badge tone="warn">Needs replan</Badge>
  if (isPast(task.currentDueDate)) return <Badge tone="warn">Overdue</Badge>
  return <Badge tone="neutral">Todo</Badge>
}

export function WeeklyPlannerView({
  weekAnchor,
  onOpenTask
}: {
  weekAnchor: Date
  onOpenTask: (id: string) => void
}): JSX.Element {
  const { tasks, query, toggleComplete, postpone } = usePlanner()

  const grouped = useMemo(() => {
    const s = startOfWeek(weekAnchor)
    const e = endOfWeek(weekAnchor)
    const q = query.trim().toLowerCase()

    const inWeek = tasks.filter((t) => {
      const d = fromYmd(t.assignedDate)
      return d >= s && d <= e
    })

    const filtered = !q
      ? inWeek
      : inWeek.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
        )

    const map = new Map<string, PlannerTask[]>()
    for (let i = 0; i < 7; i++) {
      const d = new Date(s)
      d.setDate(s.getDate() + i)
      map.set(toYmd(d), [])
    }
    for (const t of filtered) {
      const arr = map.get(t.assignedDate) ?? []
      arr.push(t)
      map.set(t.assignedDate, arr)
    }

    for (const [k, list] of map.entries()) {
      list.sort((a, b) => a.currentDueDate.localeCompare(b.currentDueDate))
      map.set(k, list)
    }
    return map
  }, [tasks, weekAnchor, query])

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([k, dayTasks]) => {
        const d = fromYmd(k)
        const dayLabel = `${DOW[d.getDay()]} • ${d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric'
        })}`

        return (
          <Card key={k} className="p-0">
            <div className="border-b border-paper-200 px-5 py-3">
              <p className="font-medium text-ink-900">{dayLabel}</p>
            </div>

            {dayTasks.length === 0 ? (
              <div className="px-5 py-5 text-sm text-ink-500">No tasks scheduled.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="bg-paper-100/70 text-xs text-ink-600">
                    <tr>
                      <th className="px-4 py-2">Done</th>
                      <th className="px-4 py-2">Task</th>
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Planner</th>
                      <th className="px-4 py-2">Original due</th>
                      <th className="px-4 py-2">Current due</th>
                      <th className="px-4 py-2">Max postpone</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayTasks.map((t) => {
                      const limit = t.plannerType === 'weekly' ? 3 : 5
                      const maxPost = addDaysYmd(t.originalDueDate, limit)
                      return (
                        <tr key={t.id} className="border-t border-paper-200/80">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={t.status === 'completed'}
                              onChange={() => toggleComplete(t.id)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              className="max-w-[260px] truncate font-medium text-ink-900 hover:underline"
                              onClick={() => onOpenTask(t.id)}
                            >
                              {t.title}
                            </button>
                          </td>
                          <td className="px-4 py-3">{t.category}</td>
                          <td className="px-4 py-3">{rowStatus(t)}</td>
                          <td className="px-4 py-3 capitalize">{t.plannerType}</td>
                          <td className="px-4 py-3">{t.originalDueDate}</td>
                          <td className="px-4 py-3">{t.currentDueDate}</td>
                          <td className="px-4 py-3">{maxPost}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="secondary"
                                className="px-2 py-1 text-xs"
                                onClick={() => {
                                  const res = postpone(t.id)
                                  if (!res.ok && res.warning) alert(res.warning)
                                }}
                              >
                                Postpone
                              </Button>
                              <Button
                                variant="secondary"
                                className="px-2 py-1 text-xs"
                                onClick={() => onOpenTask(t.id)}
                              >
                                Details
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

