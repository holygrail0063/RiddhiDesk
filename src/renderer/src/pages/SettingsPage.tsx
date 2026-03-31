import { useEffect, useState } from 'react'
import { useAuth } from '@/store/authContext'
import { useAppData } from '@/store/appDataContext'
import { saveSettings } from '@/services/settingsService'
import { seedDemoData } from '@/services/seedService'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function SettingsPage(): JSX.Element {
  const { user, allowedEmail } = useAuth()
  const { settings, refreshSettings } = useAppData()
  const [reminders, setReminders] = useState(true)
  const [dueDates, setDueDates] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    if (settings?.notificationPreferences) {
      setReminders(settings.notificationPreferences.reminders)
      setDueDates(settings.notificationPreferences.dueDates)
    }
  }, [settings])

  const save = async (): Promise<void> => {
    if (!user) return
    setBusy(true)
    setMsg(null)
    try {
      await saveSettings(user.uid, {
        notificationPreferences: { reminders, dueDates },
        theme: settings?.theme ?? 'light',
        allowedEmail: settings?.allowedEmail ?? allowedEmail
      })
      await refreshSettings()
      setMsg('Saved.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setBusy(false)
    }
  }

  const seed = async (): Promise<void> => {
    if (!user) return
    if (!confirm('Add example actuarial data? This will create new documents.')) return
    setBusy(true)
    setMsg(null)
    try {
      await seedDemoData(user.uid)
      setMsg('Demo data added.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Seed failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink-900">Settings</h1>
        <p className="mt-1 text-ink-600">Notifications and demo content.</p>
      </div>

      <Card>
        <h2 className="font-display text-lg font-semibold text-ink-900">Access</h2>
        <p className="mt-2 text-sm text-ink-700">
          This build only allows:{' '}
          <span className="font-mono text-ink-900">{allowedEmail || '(set VITE_ALLOWED_EMAIL)'}</span>
        </p>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold text-ink-900">Desktop notifications</h2>
        <p className="mt-1 text-sm text-ink-600">
          Local reminders run while RiddhiDesk is open. No cloud push.
        </p>
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-2 text-sm text-ink-800">
            <input
              type="checkbox"
              checked={reminders}
              onChange={(e) => setReminders(e.target.checked)}
            />
            Reminder date/time alerts
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-800">
            <input
              type="checkbox"
              checked={dueDates}
              onChange={(e) => setDueDates(e.target.checked)}
            />
            Overdue due-date alerts (once per day per item)
          </label>
        </div>
        <Button className="mt-4" disabled={busy} onClick={() => void save()}>
          Save preferences
        </Button>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold text-ink-900">Demo data</h2>
        <p className="mt-2 text-sm text-ink-700">
          Load sample exams, fees, notes, and internship-style plans into your private Firestore.
        </p>
        <Button variant="secondary" className="mt-3" disabled={busy} onClick={() => void seed()}>
          Load example seed data
        </Button>
      </Card>

      {msg && <p className="text-sm text-sage-600">{msg}</p>}
    </div>
  )
}
