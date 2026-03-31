import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import { useAuth } from '@/store/authContext'
import { subscribeDeadlines } from '@/services/deadlinesService'
import { subscribeNotes } from '@/services/notesService'
import { subscribePlans } from '@/services/plansService'
import { getSettings } from '@/services/settingsService'
import type { AppSettings, Deadline, Note, Plan } from '@/types'
import { useNotificationScheduler } from '@/hooks/useNotificationScheduler'

type AppDataContextValue = {
  notes: Note[]
  deadlines: Deadline[]
  plans: Plan[]
  settings: AppSettings | null
  loading: boolean
  error: string | null
  refreshSettings: () => Promise<void>
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

const defaultSettings = (email: string): AppSettings => ({
  allowedEmail: email,
  notificationPreferences: { reminders: true, dueDates: true },
  theme: 'light'
})

export function AppDataProvider({ children }: { children: ReactNode }): JSX.Element {
  const { user, status } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const uid = user?.uid
  const allowedEmail = (import.meta.env.VITE_ALLOWED_EMAIL || '').trim()

  useEffect(() => {
    if (status !== 'allowed' || !uid) {
      setNotes([])
      setDeadlines([])
      setPlans([])
      setSettings(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    let unsubNotes: (() => void) | undefined
    let unsubDl: (() => void) | undefined
    let unsubPl: (() => void) | undefined
    try {
      unsubNotes = subscribeNotes(uid, setNotes)
      unsubDl = subscribeDeadlines(uid, setDeadlines)
      unsubPl = subscribePlans(uid, setPlans)
      void (async () => {
        try {
          const s = await getSettings(uid)
          setSettings(s ?? defaultSettings(allowedEmail))
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to load settings')
          setSettings(defaultSettings(allowedEmail))
        } finally {
          setLoading(false)
        }
      })()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to subscribe')
      setLoading(false)
    }
    return () => {
      unsubNotes?.()
      unsubDl?.()
      unsubPl?.()
    }
  }, [status, uid, allowedEmail])

  const refreshSettings = async () => {
    if (!uid) return
    const s = await getSettings(uid)
    setSettings(s ?? defaultSettings(allowedEmail))
  }

  useNotificationScheduler(uid, deadlines, settings?.notificationPreferences ?? null)

  const value = useMemo(
    () => ({
      notes,
      deadlines,
      plans,
      settings,
      loading,
      error,
      refreshSettings
    }),
    [notes, deadlines, plans, settings, loading, error, refreshSettings]
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext)
  if (!ctx) {
    throw new Error('useAppData must be used within AppDataProvider')
  }
  return ctx
}
