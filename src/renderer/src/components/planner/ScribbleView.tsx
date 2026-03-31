import { useEffect, useMemo, useRef, useState } from 'react'
import { TextArea } from '@/components/ui/Input'
import { useAuth } from '@/store/authContext'
import { saveScribbleNote, subscribeScribbleNote } from '@/services/firestore/notes'

export function ScribbleView(): JSX.Element {
  const { user, status } = useAuth()
  const [body, setBody] = useState('')
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [flashJustSaved, setFlashJustSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipNextSave = useRef(true)

  useEffect(() => {
    if (status !== 'allowed' || !user) {
      setBody('')
      setUpdatedAt(null)
      setLoading(false)
      return
    }
    setLoading(true)
    skipNextSave.current = true
    const unsub = subscribeScribbleNote(user.uid, (note) => {
      setBody(note?.content ?? '')
      setUpdatedAt(note?.updatedAt ?? null)
      setLoading(false)
      skipNextSave.current = true
    })
    return () => unsub()
  }, [user, status])

  useEffect(() => {
    if (status !== 'allowed' || !user || loading) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    const id = window.setTimeout(() => {
      const nextUpdatedAt = new Date().toISOString()
      void saveScribbleNote(user.uid, body)
      setUpdatedAt(nextUpdatedAt)
      setFlashJustSaved(true)
      if (flashTimer.current) clearTimeout(flashTimer.current)
      flashTimer.current = setTimeout(() => setFlashJustSaved(false), 2800)
    }, 500)

    return () => {
      window.clearTimeout(id)
    }
  }, [body, user, status, loading])

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current)
    }
  }, [])

  const statusLine = useMemo(() => {
    if (flashJustSaved) return 'Autosaved just now'
    if (!updatedAt) return 'Not saved yet'
    const d = new Date(updatedAt)
    return `Last updated ${d.toLocaleString()}`
  }, [updatedAt, flashJustSaved])

  return (
    <div className="flex w-full justify-center px-2 py-4 lg:px-6">
      <div className="w-full max-w-[1000px] xl:max-w-[1100px]">
        <div className="rounded-2xl border border-paper-200/80 bg-gradient-to-b from-white/90 to-paper-50/95 p-6 shadow-card sm:p-8 lg:p-10">
          <TextArea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write anything... grocery list, study notes, reminders"
            className="min-h-[min(58vh,640px)] w-full resize-y border-0 bg-transparent text-[17px] leading-8 text-ink-900 shadow-none ring-0 placeholder:text-ink-500/70 focus:border-transparent focus:ring-0"
          />
          <p className="mt-6 text-xs text-ink-500">{loading ? 'Loading note…' : statusLine}</p>
        </div>
      </div>
    </div>
  )
}
