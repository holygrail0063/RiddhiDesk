import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '@/firebase/config'

export type ScribbleNote = {
  content: string
  updatedAt: string | null
}

const noteRef = (uid: string) => doc(db(), 'users', uid, 'notes', 'main')

export function subscribeScribbleNote(
  uid: string,
  cb: (note: ScribbleNote | null) => void
): Unsubscribe {
  return onSnapshot(noteRef(uid), (snap) => {
    if (!snap.exists()) {
      cb(null)
      return
    }
    const data = snap.data() as { content?: string; updatedAt?: { toDate?: () => Date } | null }
    cb({
      content: data.content ?? '',
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null
    })
  })
}

export async function saveScribbleNote(uid: string, content: string): Promise<void> {
  await setDoc(
    noteRef(uid),
    {
      content,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  )
}
