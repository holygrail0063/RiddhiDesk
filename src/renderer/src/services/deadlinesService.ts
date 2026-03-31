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
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Deadline, DeadlineInput } from '@/types'

const col = (uid: string) => collection(db(), 'users', uid, 'deadlines')

function inputToFirestore(input: DeadlineInput) {
  return {
    title: input.title,
    description: input.description,
    category: input.category,
    dueDate: Timestamp.fromDate(input.dueDate),
    reminderAt: input.reminderAt ? Timestamp.fromDate(input.reminderAt) : null,
    priority: input.priority,
    completed: input.completed
  }
}

export async function listDeadlines(uid: string): Promise<Deadline[]> {
  const q = query(col(uid), orderBy('dueDate', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Deadline))
}

export function subscribeDeadlines(
  uid: string,
  cb: (items: Deadline[]) => void
): Unsubscribe {
  const q = query(col(uid), orderBy('dueDate', 'asc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Deadline)))
  })
}

export async function createDeadline(uid: string, input: DeadlineInput): Promise<string> {
  const ref = await addDoc(col(uid), {
    ...inputToFirestore(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  return ref.id
}

export async function updateDeadline(
  uid: string,
  id: string,
  input: Partial<DeadlineInput>
): Promise<void> {
  const ref = doc(db(), 'users', uid, 'deadlines', id)
  const patch: Record<string, unknown> = { updatedAt: serverTimestamp() }
  if (input.title !== undefined) patch.title = input.title
  if (input.description !== undefined) patch.description = input.description
  if (input.category !== undefined) patch.category = input.category
  if (input.dueDate !== undefined) patch.dueDate = Timestamp.fromDate(input.dueDate)
  if (input.reminderAt !== undefined) {
    patch.reminderAt = input.reminderAt ? Timestamp.fromDate(input.reminderAt) : null
  }
  if (input.priority !== undefined) patch.priority = input.priority
  if (input.completed !== undefined) patch.completed = input.completed
  await updateDoc(ref, patch)
}

export async function deleteDeadline(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db(), 'users', uid, 'deadlines', id))
}
