import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAppData } from '@/store/appDataContext'
import { buildDashboard } from '@/services/dashboardService'
import { formatShort } from '@/lib/dates'
import type { Deadline } from '@/types'

function Row({ d, overdue }: { d: Deadline; overdue?: boolean }): JSX.Element {
  return (
    <li
      className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-2 text-sm ${
        overdue ? 'border-red-200 bg-red-50/80' : 'border-paper-200 bg-paper-50/80'
      }`}
    >
      <div>
        <p className="font-medium text-ink-900">{d.title}</p>
        <p className="text-xs text-ink-500">{formatShort(d.dueDate)}</p>
      </div>
      {overdue && <Badge tone="warn">Overdue</Badge>}
    </li>
  )
}

export function DashboardPage(): JSX.Element {
  const { deadlines, plans, loading, error } = useAppData()

  const dash = useMemo(
    () => buildDashboard(deadlines, plans),
    [deadlines, plans]
  )

  if (loading) {
    return <p className="text-sm text-ink-600">Loading your dashboard…</p>
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink-900">Dashboard</h1>
        <p className="mt-1 text-ink-600">A calm view of what needs attention next.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink-900">Upcoming due dates</h2>
            <Link to="/deadlines" className="text-xs font-medium text-sage-600 hover:underline">
              View all
            </Link>
          </div>
          {dash.upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-ink-500">No upcoming deadlines.</p>
          ) : (
            <ul className="space-y-2">
              {dash.upcomingDeadlines.map((d) => (
                <Row key={d.id} d={d} />
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink-900">Actuarial exams</h2>
            <Link to="/deadlines" className="text-xs font-medium text-sage-600 hover:underline">
              View all
            </Link>
          </div>
          {dash.upcomingExams.length === 0 ? (
            <p className="text-sm text-ink-500">No exam-related items yet.</p>
          ) : (
            <ul className="space-y-2">
              {dash.upcomingExams.map((d) => (
                <Row key={d.id} d={d} />
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">This week</h2>
          {dash.weekGoals.length === 0 ? (
            <p className="text-sm text-ink-500">Nothing due this week.</p>
          ) : (
            <ul className="space-y-2">
              {dash.weekGoals.map((d) => (
                <Row key={d.id} d={d} />
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">Overdue</h2>
          {dash.overdue.length === 0 ? (
            <p className="text-sm text-ink-500">No overdue tasks. Nice work.</p>
          ) : (
            <ul className="space-y-2">
              {dash.overdue.map((d) => (
                <Row key={d.id} d={d} overdue />
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Future milestones</h2>
          <Link to="/plans" className="text-xs font-medium text-sage-600 hover:underline">
            View plans
          </Link>
        </div>
        {dash.milestones.length === 0 ? (
          <p className="text-sm text-ink-500">No dated milestones yet.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {dash.milestones.map((p) => (
              <li key={p.id} className="rounded-xl border border-paper-200 bg-paper-50/80 p-3">
                <p className="font-medium text-ink-900">{p.title}</p>
                <p className="text-xs text-ink-500">
                  {p.targetDate ? formatShort(p.targetDate) : 'No date'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
