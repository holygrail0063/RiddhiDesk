import { useEffect, useState } from 'react'
import { useDemoAuth } from '@/store/demoAuth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function SettingsPage(): JSX.Element {
  const { user, signOut } = useDemoAuth()
  const [reminders, setReminders] = useState(true)
  const [dueDates, setDueDates] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('riddhidesk:demo:settings')
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
        'riddhidesk:demo:settings',
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
        <p className="mt-1 text-ink-600">Demo preferences (no Firebase wired yet).</p>
      </div>

      <Card>
        <h2 className="font-display text-lg font-semibold text-ink-900">Access</h2>
        <p className="mt-2 text-sm text-ink-700">
          Signed in as <span className="font-mono text-ink-900">{user?.email}</span>
        </p>
        <Button variant="secondary" className="mt-4" onClick={signOut}>
          Sign out (demo)
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

      <Card>
        <h2 className="font-display text-lg font-semibold text-ink-900">Demo data</h2>
        <p className="mt-2 text-sm text-ink-700">
          This UI uses local demo tasks for now. You can reset the app state anytime.
        </p>
        <Button
          variant="secondary"
          className="mt-3"
          disabled={busy}
          onClick={() => {
            if (!confirm('Reset demo settings and reload?')) return
            localStorage.removeItem('riddhidesk:demo:settings')
            location.reload()
          }}
        >
          Reset demo settings
        </Button>
      </Card>

      {msg && <p className="text-sm text-sage-600">{msg}</p>}
    </div>
  )
}
