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
      <div className="grid grid-cols-7 gap-2 pb-3">
        {DOW.map((d) => (
          <div
            key={d}
            className="px-2 text-[11px] font-medium tracking-wide text-ink-500"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3 lg:gap-4">
        {cells.map((d) => {
          const key = toYmd(d)
          const inMonth = sameMonth(d, month)
          const list = tasksByDay.get(key) ?? []
          const monthLabel = d.toLocaleString(undefined, { month: 'long' })
          const weekdayLabel = d.toLocaleString(undefined, { weekday: 'long' })
          const taskCountLabel = `${list.length} task${list.length === 1 ? '' : 's'}`

          return (
            <div
              key={key}
              className={cn(
                'rounded-3xl border bg-white/80 p-1 shadow-soft backdrop-blur-sm transition hover:shadow-card',
                inMonth
                  ? 'border-paper-200'
                  : 'border-paper-200/70 bg-paper-50/80 opacity-80'
              )}
            >
              <button
                type="button"
                onClick={() => onOpenDay(key)}
                className="flex w-full items-start justify-between rounded-[20px] px-3 pb-2 pt-3 text-left hover:bg-paper-100/60"
              >
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'mt-0.5 inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-2xl px-2 text-sm font-semibold',
                        key === todayKey
                          ? 'bg-sage-600 text-white shadow-soft'
                          : inMonth
                            ? 'bg-paper-100 text-ink-900 ring-1 ring-paper-200'
                            : 'bg-paper-100/80 text-ink-500 ring-1 ring-paper-200'
                      )}
                    >
                      {d.getDate()}
                    </span>
                    <div className="min-w-0">
                      <div
                        className={cn(
                          'truncate text-sm font-semibold',
                          inMonth ? 'text-ink-900' : 'text-ink-600'
                        )}
                      >
                        {monthLabel}
                      </div>
                      <div
                        className={cn(
                          'mt-0.5 text-[11px]',
                          inMonth ? 'text-ink-500' : 'text-ink-400'
                        )}
                      >
                        {weekdayLabel}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-3 flex shrink-0 items-start pt-0.5">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-medium',
                      list.length > 0
                        ? 'bg-paper-100 text-ink-600 ring-1 ring-paper-200'
                        : 'bg-paper-50 text-ink-400 ring-1 ring-paper-200/80'
                    )}
                  >
                    {taskCountLabel}
                  </span>
                </div>
              </button>

              <div className="mx-3 mb-3 border-t border-paper-200/80" />

              <div className="flex min-h-[104px] flex-col gap-2 px-3 pb-3">
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
                    className="rounded-2xl border border-paper-200 bg-paper-50 px-3 py-1.5 text-left text-[11px] font-medium text-ink-600 hover:bg-paper-100"
                    onClick={() => onOpenDay(key)}
                  >
                    +{list.length - 2} more
                  </button>
                )}
                {list.length === 0 && (
                  <div
                    className="rounded-2xl border border-dashed border-paper-200 bg-paper-50/50 px-2 py-4"
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

