import { useMemo, useState } from 'react'
import { useAuth } from '@/store/authContext'
import { useAppData } from '@/store/appDataContext'
import { createNote, deleteNote, updateNote } from '@/services/notesService'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { Note, NoteCategory } from '@/types'
import { formatShort } from '@/lib/dates'

const CATEGORIES: NoteCategory[] = [
  'Exams',
  'Fees',
  'Study Goals',
  'Personal Plans',
  'Internship Plans',
  'Other'
]

export function NotesPage(): JSX.Element {
  const { user } = useAuth()
  const { notes, loading, error } = useAppData()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('all')
  const [editing, setEditing] = useState<Note | null>(null)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<NoteCategory>('Exams')

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    return notes.filter((n) => {
      if (cat !== 'all' && n.category !== cat) return false
      if (!t) return true
      return (
        n.title.toLowerCase().includes(t) || n.content.toLowerCase().includes(t)
      )
    })
  }, [notes, q, cat])

  const resetForm = (): void => {
    setTitle('')
    setContent('')
    setCategory('Exams')
    setEditing(null)
    setCreating(false)
  }

  const openNew = (): void => {
    resetForm()
    setCreating(true)
  }

  const openEdit = (n: Note): void => {
    setCreating(false)
    setEditing(n)
    setTitle(n.title)
    setContent(n.content)
    setCategory(n.category)
  }

  const save = async (): Promise<void> => {
    if (!user || !title.trim()) return
    if (editing) {
      await updateNote(user.uid, editing.id, {
        title: title.trim(),
        content,
        category
      })
    } else {
      await createNote(user.uid, {
        title: title.trim(),
        content,
        category
      })
    }
    resetForm()
  }

  const remove = async (id: string): Promise<void> => {
    if (!user) return
    if (!confirm('Delete this note?')) return
    await deleteNote(user.uid, id)
    if (editing?.id === id) resetForm()
  }

  if (loading) return <p className="text-sm text-ink-600">Loading notes…</p>
  if (error) return <p className="text-sm text-red-700">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Notes</h1>
          <p className="mt-1 text-ink-600">Capture study ideas and tagged reminders.</p>
        </div>
        <Button onClick={openNew}>New note</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search title or content…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-md flex-1"
        />
        <select
          className="rounded-xl border border-paper-300 bg-paper-50 px-3 py-2 text-sm"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {(creating || editing) && (
        <Card>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
            {editing ? 'Edit note' : 'New note'}
          </h2>
          <div className="space-y-3">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              className="w-full rounded-xl border border-paper-300 bg-paper-50 px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value as NoteCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <TextArea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={() => void save()}>Save</Button>
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-500">No notes match your filters.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((n) => (
            <Card key={n.id}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone="sage">{n.category}</Badge>
                <span className="text-xs text-ink-500">
                  Updated {formatShort(n.updatedAt)}
                </span>
              </div>
              <h3 className="font-medium text-ink-900">{n.title}</h3>
              <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-ink-700">
                {n.content || '—'}
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" className="text-xs py-1.5" onClick={() => openEdit(n)}>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  className="text-xs py-1.5"
                  onClick={() => void remove(n.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
