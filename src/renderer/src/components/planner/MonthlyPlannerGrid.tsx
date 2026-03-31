import { useMemo } from 'react'
import { cn } from '@/lib/cn'
import { startOfMonthGrid, toYmd, sameMonth } from '@/lib/dateMath'
import { usePlanner } from '@/store/plannerContext'
import { TaskPill } from '@/components/planner/TaskPill'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function MonthlyPlannerGrid({
  month,
  onOpenDay,
  onOpenTask
}: {
  month: Date
  onOpenDay: (ymd: string) => void
  onOpenTask: (taskId: string) => void
}): JSX.Element {
  const { tasks, selectedTaskId, setSelectedTaskId, toggleComplete, query } =
    usePlanner()

  const tasksByDay = useMemo(() => {
    const map = new Map<string, typeof tasks>()
    const q = query.trim().toLowerCase()
    const filtered = !q
      ? tasks
      : tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
        )

    for (const t of filtered) {
      const key = t.assignedDate
      const list = map.get(key) ?? []
      list.push(t)
      map.set(key, list)
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1
        if (a.status !== 'completed' && b.status === 'completed') return -1
        return a.currentDueDate.localeCompare(b.currentDueDate)
      })
      map.set(k, list)
    }
    return map
  }, [tasks, query])

  const cells = useMemo(() => {
    const start = startOfMonthGrid(month)
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [month])

  const todayKey = toYmd(new Date())

  return (
    <div className="min-w-0">
      <div className="grid grid-cols-7 gap-2 pb-2">
        {DOW.map((d) => (
          <div
            key={d}
            className="px-1 text-xs font-medium tracking-wide text-ink-500"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-4">
        {cells.map((d) => {
          const key = toYmd(d)
          const inMonth = sameMonth(d, month)
          const list = tasksByDay.get(key) ?? []

          return (
            <div
              key={key}
              className={cn(
                'rounded-2xl border bg-white/70 p-1 shadow-soft backdrop-blur-sm transition hover:shadow-card',
                inMonth ? 'border-paper-200' : 'border-paper-200/70 opacity-75'
              )}
            >
              <button
                type="button"
                onClick={() => onOpenDay(key)}
                className="flex w-full items-center justify-between rounded-xl px-3 pb-2 pt-3 text-left hover:bg-paper-100/60"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'grid h-7 w-7 place-items-center rounded-xl text-xs font-semibold',
                      key === todayKey
                        ? 'bg-sage-600 text-white shadow-soft'
                        : 'bg-paper-100 text-ink-900 ring-1 ring-paper-200'
                    )}
                  >
                    {d.getDate()}
                  </span>
                  {!inMonth && (
                    <span className="text-[10px] font-medium text-ink-500">
                      {d.toLocaleString(undefined, { month: 'short' })}
                    </span>
                  )}
                </div>
                {list.length > 0 && (
                  <span className="text-[10px] text-ink-500">{list.length}</span>
                )}
              </button>

              <div className="flex min-h-[92px] flex-col gap-2 px-3 pb-3">
                {list.slice(0, 2).map((t) => (
                  <TaskPill
                    key={t.id}
                    task={t}
                    selected={t.id === selectedTaskId}
                    onSelect={() => {
                      setSelectedTaskId(t.id)
                      onOpenTask(t.id)
                    }}
                    onToggle={() => toggleComplete(t.id)}
                  />
                ))}
                {list.length > 2 && (
                  <button
                    type="button"
                    className="rounded-xl border border-paper-200 bg-paper-50 px-2 py-1 text-left text-[11px] text-ink-600 hover:bg-paper-100"
                    onClick={() => onOpenDay(key)}
                  >
                    +{list.length - 2} more
                  </button>
                )}
                {list.length === 0 && (
                  <div
                    className="rounded-xl border border-dashed border-paper-200 bg-paper-50/50 px-2 py-3"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

