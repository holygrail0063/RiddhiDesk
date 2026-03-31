import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  getDoc,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Reminder } from '@/types/reminder'

const col = (uid: string) => collection(db(), 'users', uid, 'reminders')

export function subscribeReminders(uid: string, cb: (items: Reminder[]) => void): Unsubscribe {
  const q = query(col(uid), orderBy('at', 'asc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Reminder, 'id'>) })))
  })
}

export async function upsertReminder(uid: string, reminder: Reminder): Promise<void> {
  const ref = doc(db(), 'users', uid, 'reminders', reminder.id)
  const current = await getDoc(ref)
  await setDoc(
    ref,
    {
      title: reminder.title,
      description: reminder.description,
      at: reminder.at,
      category: reminder.category,
      status: reminder.status,
      notificationSent: reminder.notificationSent ?? false,
      linkedTaskId: reminder.linkedTaskId ?? null,
      createdAt: current.exists() ? current.data().createdAt ?? serverTimestamp() : serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  )
}

export async function updateReminder(
  uid: string,
  id: string,
  patch: Partial<Omit<Reminder, 'id'>>
): Promise<void> {
  const ref = doc(db(), 'users', uid, 'reminders', id)
  await updateDoc(ref, {
    ...patch,
    updatedAt: serverTimestamp()
  })
}

export async function deleteReminder(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db(), 'users', uid, 'reminders', id))
}
