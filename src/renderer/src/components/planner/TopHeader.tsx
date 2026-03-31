import { Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { usePlanner } from '@/store/plannerContext'
import { cn } from '@/lib/cn'

export function TopHeader({
  month,
  onToday,
  onAddTask
}: {
  month: Date
  onToday: () => void
  onAddTask: () => void
}): JSX.Element {
  const { viewMode, setViewMode, query, setQuery } = usePlanner()
  const todayMeta = new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  })

  return (
    <header className="shrink-0 border-b border-paper-200 bg-paper-50/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8 lg:py-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_auto_minmax(120px,1fr)] lg:items-center lg:gap-6">
      <div className="min-w-0">
        <p className="font-display text-xl font-semibold text-ink-900 lg:text-2xl">
          {month.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </p>
        <p className="mt-1 text-xs text-ink-500">
          Monthly = overview. Weekly = action mode.
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-3 lg:items-center">
        <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-center">
          <Button
            variant="secondary"
            onClick={onToday}
            className="min-h-[48px] min-w-[76px] px-3 py-2"
          >
            <span className="flex flex-col items-start leading-none">
              <span className="text-sm font-medium">Today</span>
              <span className="mt-1 text-[10px] font-normal uppercase tracking-wide text-ink-500">
                {todayMeta}
              </span>
            </span>
          </Button>
          <div className="flex flex-wrap items-center rounded-2xl border border-paper-200 bg-white/80 p-1 shadow-soft">
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={cn(
                'rounded-xl px-3 py-2 text-xs font-medium transition',
                viewMode === 'weekly'
                  ? 'bg-sage-600 text-white shadow-soft'
                  : 'text-ink-600 hover:bg-paper-100'
              )}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setViewMode('monthly')}
              className={cn(
                'rounded-xl px-3 py-2 text-xs font-medium transition',
                viewMode === 'monthly'
                  ? 'bg-sage-600 text-white shadow-soft'
                  : 'text-ink-600 hover:bg-paper-100'
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setViewMode('scribble')}
              className={cn(
                'rounded-xl px-3 py-2 text-xs font-medium transition',
                viewMode === 'scribble'
                  ? 'bg-sage-600 text-white shadow-soft'
                  : 'text-ink-600 hover:bg-paper-100'
              )}
            >
              Scribble
            </button>
          </div>
          <Button onClick={onAddTask} className="min-h-[44px] px-4">
            Add Task
          </Button>
        </div>

        <div className="w-full lg:max-w-md">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <Input
              className="h-11 rounded-2xl border-paper-200 bg-white/80 pl-9"
              placeholder="Search tasks…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="hidden lg:block" aria-hidden="true" />
      </div>
    </header>
  )
}
