import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { AppSettings } from '@/types'

const SETTINGS_DOC = 'main'

export async function getSettings(uid: string): Promise<AppSettings | null> {
  const ref = doc(db(), 'users', uid, 'settings', SETTINGS_DOC)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as AppSettings
}

export async function ensureSettings(uid: string, allowedEmail: string): Promise<AppSettings> {
  const ref = doc(db(), 'users', uid, 'settings', SETTINGS_DOC)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    return snap.data() as AppSettings
  }
  const defaults: AppSettings = {
    allowedEmail,
    notificationPreferences: { reminders: true, dueDates: true },
    theme: 'light'
  }
  await setDoc(ref, {
    ...defaults,
    updatedAt: serverTimestamp()
  })
  return defaults
}

export async function saveSettings(uid: string, partial: Partial<AppSettings>): Promise<void> {
  const ref = doc(db(), 'users', uid, 'settings', SETTINGS_DOC)
  await setDoc(
    ref,
    {
      ...partial,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  )
}
