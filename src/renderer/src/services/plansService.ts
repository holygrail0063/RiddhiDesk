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
import type { Plan, PlanInput } from '@/types'

const col = (uid: string) => collection(db(), 'users', uid, 'plans')

function inputToFirestore(input: PlanInput) {
  return {
    title: input.title,
    description: input.description,
    targetDate: input.targetDate ? Timestamp.fromDate(input.targetDate) : null,
    status: input.status,
    category: input.category
  }
}

export async function listPlans(uid: string): Promise<Plan[]> {
  const q = query(col(uid), orderBy('targetDate', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Plan))
}

export function subscribePlans(uid: string, cb: (items: Plan[]) => void): Unsubscribe {
  const q = query(col(uid), orderBy('targetDate', 'asc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Plan)))
  })
}

export async function createPlan(uid: string, input: PlanInput): Promise<string> {
  const ref = await addDoc(col(uid), {
    ...inputToFirestore(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  return ref.id
}

export async function updatePlan(
  uid: string,
  id: string,
  input: Partial<PlanInput>
): Promise<void> {
  const ref = doc(db(), 'users', uid, 'plans', id)
  const patch: Record<string, unknown> = { updatedAt: serverTimestamp() }
  if (input.title !== undefined) patch.title = input.title
  if (input.description !== undefined) patch.description = input.description
  if (input.targetDate !== undefined) {
    patch.targetDate = input.targetDate ? Timestamp.fromDate(input.targetDate) : null
  }
  if (input.status !== undefined) patch.status = input.status
  if (input.category !== undefined) patch.category = input.category
  await updateDoc(ref, patch)
}

export async function deletePlan(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db(), 'users', uid, 'plans', id))
}
