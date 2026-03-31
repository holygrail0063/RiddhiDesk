import { useMemo, useState } from 'react'
import { useAuth } from '@/store/authContext'
import { useAppData } from '@/store/appDataContext'
import { createPlan, deletePlan, updatePlan } from '@/services/plansService'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { Plan, PlanCategory, PlanStatus } from '@/types'
import { formatShort } from '@/lib/dates'

const CATEGORIES: PlanCategory[] = [
  'Long-term goals',
  'Exam roadmap',
  'Internships',
  'Certifications',
  'Personal milestones'
]

export function PlansPage(): JSX.Element {
  const { user } = useAuth()
  const { plans, loading, error } = useAppData()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Plan | null>(null)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDateStr, setTargetDateStr] = useState('')
  const [status, setStatus] = useState<PlanStatus>('planned')
  const [category, setCategory] = useState<PlanCategory>('Long-term goals')

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    return plans.filter((p) => {
      if (!t) return true
      return (
        p.title.toLowerCase().includes(t) ||
        p.description.toLowerCase().includes(t) ||
        p.category.toLowerCase().includes(t)
      )
    })
  }, [plans, q])

  const resetForm = (): void => {
    setTitle('')
    setDescription('')
    setTargetDateStr('')
    setStatus('planned')
    setCategory('Long-term goals')
    setEditing(null)
    setCreating(false)
  }

  const openNew = (): void => {
    resetForm()
    setCreating(true)
  }

  const openEdit = (p: Plan): void => {
    setCreating(false)
    setEditing(p)
    setTitle(p.title)
    setDescription(p.description)
    setTargetDateStr(
      p.targetDate
        ? p.targetDate.toDate().toISOString().slice(0, 10)
        : ''
    )
    setStatus(p.status)
    setCategory(p.category)
  }

  const save = async (): Promise<void> => {
    if (!user || !title.trim()) return
    const targetDate = targetDateStr
      ? new Date(`${targetDateStr}T12:00:00`)
      : null
    const payload = {
      title: title.trim(),
      description,
      targetDate,
      status,
      category
    }
    if (editing) {
      await updatePlan(user.uid, editing.id, payload)
    } else {
      await createPlan(user.uid, payload)
    }
    resetForm()
  }

  const remove = async (id: string): Promise<void> => {
    if (!user) return
    if (!confirm('Delete this plan?')) return
    await deletePlan(user.uid, id)
    if (editing?.id === id) resetForm()
  }

  if (loading) return <p className="text-sm text-ink-600">Loading plans…</p>
  if (error) return <p className="text-sm text-red-700">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Future plans</h1>
          <p className="mt-1 text-ink-600">Roadmaps, internships, certifications, milestones.</p>
        </div>
        <Button onClick={openNew}>Add plan</Button>
      </div>

      <Input
        placeholder="Search…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-md"
      />

      {(creating || editing) && (
        <Card>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
            {editing ? 'Edit plan' : 'New plan'}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-ink-600">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-ink-600">Description</label>
              <TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-600">Category</label>
              <select
                className="mt-1 w-full rounded-xl border border-paper-300 bg-paper-50 px-3 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value as PlanCategory)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-600">Status</label>
              <select
                className="mt-1 w-full rounded-xl border border-paper-300 bg-paper-50 px-3 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as PlanStatus)}
              >
                <option value="planned">Planned</option>
                <option value="in_progress">In progress</option>
                <option value="on_hold">On hold</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-ink-600">
                Target date (optional)
              </label>
              <Input
                type="date"
                value={targetDateStr}
                onChange={(e) => setTargetDateStr(e.target.value)}
              />
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button onClick={() => void save()}>Save</Button>
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.length === 0 ? (
          <Card className="md:col-span-2">
            <p className="text-sm text-ink-500">No plans match your search.</p>
          </Card>
        ) : (
          filtered.map((p) => (
            <Card key={p.id}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone="sage">{p.category}</Badge>
                <Badge tone="neutral">{p.status.replace('_', ' ')}</Badge>
              </div>
              <h3 className="font-medium text-ink-900">{p.title}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">
                {p.description || '—'}
              </p>
              <p className="mt-2 text-xs text-ink-500">
                {p.targetDate ? `Target: ${formatShort(p.targetDate)}` : 'No target date'}
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" className="text-xs py-1.5" onClick={() => openEdit(p)}>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  className="text-xs py-1.5"
                  onClick={() => void remove(p.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
