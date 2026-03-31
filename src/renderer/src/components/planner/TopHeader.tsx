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

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-paper-200 bg-paper-50/95 px-6 py-4 backdrop-blur lg:gap-6 lg:px-8 lg:py-5">
      <div className="min-w-0 flex-1 basis-[200px]">
        <p className="font-display text-xl font-semibold text-ink-900 lg:text-2xl">
          {month.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </p>
        <p className="mt-1 text-xs text-ink-500">
          Monthly = overview. Weekly = action mode.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={onToday}>
          Today
        </Button>
        <div className="flex items-center rounded-xl border border-paper-200 bg-white/70 p-1 shadow-soft">
          <button
            type="button"
            onClick={() => setViewMode('weekly')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition',
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
              'rounded-lg px-3 py-1.5 text-xs font-medium transition',
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
              'rounded-lg px-3 py-1.5 text-xs font-medium transition',
              viewMode === 'scribble'
                ? 'bg-sage-600 text-white shadow-soft'
                : 'text-ink-600 hover:bg-paper-100'
            )}
          >
            Scribble
          </button>
        </div>
        <Button onClick={onAddTask}>Add Task</Button>
      </div>

      <div className="flex w-full min-w-[min(100%,280px)] max-w-md flex-1 items-center justify-end lg:w-auto lg:min-w-[300px]">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <Input
            className="pl-9"
            placeholder="Search tasks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
    </header>
  )
}
