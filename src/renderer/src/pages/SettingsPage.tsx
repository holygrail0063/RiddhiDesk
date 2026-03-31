import { useEffect, useState } from 'react'
import { useAuth } from '@/store/authContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function SettingsPage(): JSX.Element {
  const { user, signOutApp } = useAuth()
  const [reminders, setReminders] = useState(true)
  const [dueDates, setDueDates] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const SETTINGS_KEY = 'riddhidesk:settings:v1'

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      if (!raw) return
      const s = JSON.parse(raw) as { reminders?: boolean; dueDates?: boolean }
      if (typeof s.reminders === 'boolean') setReminders(s.reminders)
      if (typeof s.dueDates === 'boolean') setDueDates(s.dueDates)
    } catch {
      // ignore
    }
  }, [])

  const save = async (): Promise<void> => {
    setBusy(true)
    setMsg(null)
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ reminders, dueDates })
      )
      setMsg('Saved.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink-900">Settings</h1>
        <p className="mt-1 text-ink-600">Notification preferences (stored locally in this browser).</p>
      </div>

      <Card>
        <h2 className="font-display text-lg font-semibold text-ink-900">Access</h2>
        <p className="mt-2 text-sm text-ink-700">
          Signed in as <span className="font-mono text-ink-900">{user?.email}</span>
        </p>
        <Button variant="secondary" className="mt-4" onClick={() => void signOutApp()}>
          Sign out
        </Button>
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

      {msg && <p className="text-sm text-sage-600">{msg}</p>}
    </div>
  )
}
