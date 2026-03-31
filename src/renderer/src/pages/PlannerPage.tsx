import { useEffect, useMemo, useState } from 'react'
import { usePlanner } from '@/store/plannerContext'
import { TopHeader } from '@/components/planner/TopHeader'
import { MonthlyPlannerGrid } from '@/components/planner/MonthlyPlannerGrid'
import { AddTaskModal } from '@/components/planner/AddTaskModal'
import { DayTasksModal } from '@/components/planner/DayTasksModal'
import { TaskDetailsModal } from '@/components/planner/TaskDetailsModal'
import { WeeklyPlannerView } from '@/components/planner/WeeklyPlannerView'
import { ScribbleView } from '@/components/planner/ScribbleView'
import type { PlannerTask } from '@/types/planner'
import { Card } from '@/components/ui/Card'

export function PlannerPage(): JSX.Element {
  const {
    viewMode,
    upsertTask,
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    toggleComplete,
    postpone,
    loading,
    error
  } = usePlanner()
  const [month, setMonth] = useState(() => new Date())

  useEffect(() => {
    const focus = (): void => {
      const id = sessionStorage.getItem('riddhidesk:focusTaskId')
      if (!id) return
      sessionStorage.removeItem('riddhidesk:focusTaskId')
      setSelectedTaskId(id)
    }
    focus()
    window.addEventListener('riddhidesk:focus-task', focus)
    return () => window.removeEventListener('riddhidesk:focus-task', focus)
  }, [setSelectedTaskId])
  const [addOpen, setAddOpen] = useState(false)
  const [dayOpen, setDayOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [activeDayKey, setActiveDayKey] = useState<string | null>(null)

  const selected = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  )
  const dayTasks = useMemo(() => {
    if (!activeDayKey) return []
    return tasks
      .filter((t) => t.assignedDate === activeDayKey)
      .sort((a, b) => a.currentDueDate.localeCompare(b.currentDueDate))
  }, [tasks, activeDayKey])

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <TopHeader
        month={month}
        onToday={() => setMonth(new Date())}
        onAddTask={() => setAddOpen(true)}
      />

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-6 pb-8 pt-2 lg:px-8 lg:pb-10">
        {error ? (
          <Card className="border-red-200 bg-red-50/40">
            <p className="text-sm text-red-900">{error}</p>
          </Card>
        ) : loading ? (
          <Card>
            <p className="text-sm text-ink-500">Loading tasks…</p>
          </Card>
        ) : viewMode !== 'scribble' && tasks.length === 0 ? (
          <Card className="mx-auto max-w-3xl rounded-3xl px-6 py-10 text-center">
            <h2 className="font-display text-2xl font-semibold text-ink-900">No tasks scheduled</h2>
            <p className="mt-2 text-sm text-ink-600">
              Start with your first task to build a clean weekly or monthly plan.
            </p>
          </Card>
        ) : viewMode === 'monthly' ? (
          <MonthlyPlannerGrid
            month={month}
            onOpenDay={(ymd) => {
              setActiveDayKey(ymd)
              setDayOpen(true)
            }}
            onOpenTask={(id) => {
              setSelectedTaskId(id)
              setTaskOpen(true)
            }}
          />
        ) : viewMode === 'weekly' ? (
          <WeeklyPlannerView
            weekAnchor={month}
            onOpenTask={(id) => {
              setSelectedTaskId(id)
              setTaskOpen(true)
            }}
          />
        ) : (
          <ScribbleView />
        )}
      </div>

      <AddTaskModal
        open={addOpen}
        onOpenChange={setAddOpen}
        initial={null}
        onSave={(t: PlannerTask) => upsertTask(t)}
      />
      <DayTasksModal
        open={dayOpen}
        onOpenChange={setDayOpen}
        dateKey={activeDayKey}
        tasks={dayTasks}
        selectedTaskId={selectedTaskId}
        onSelectTask={(id) => {
          setSelectedTaskId(id)
          setDayOpen(false)
          setTaskOpen(true)
        }}
        onToggleTask={toggleComplete}
      />
      <TaskDetailsModal
        open={taskOpen}
        onOpenChange={setTaskOpen}
        task={selected}
        onToggleComplete={toggleComplete}
        onPostpone={postpone}
      />

    </div>
  )
}

