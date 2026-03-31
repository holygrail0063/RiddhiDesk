import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Note, NoteInput } from '@/types'

const col = (uid: string) => collection(db(), 'users', uid, 'notes')

export async function listNotes(uid: string): Promise<Note[]> {
  const q = query(col(uid), orderBy('updatedAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Note))
}

export function subscribeNotes(uid: string, cb: (notes: Note[]) => void): Unsubscribe {
  const q = query(col(uid), orderBy('updatedAt', 'desc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Note)))
  })
}

export async function createNote(uid: string, input: NoteInput): Promise<string> {
  const ref = await addDoc(col(uid), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  return ref.id
}

export async function updateNote(
  uid: string,
  id: string,
  input: Partial<NoteInput>
): Promise<void> {
  const ref = doc(db(), 'users', uid, 'notes', id)
  await updateDoc(ref, {
    ...input,
    updatedAt: serverTimestamp()
  })
}

export async function deleteNote(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db(), 'users', uid, 'notes', id))
}
