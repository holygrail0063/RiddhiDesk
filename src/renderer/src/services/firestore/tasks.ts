import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { PlannerTask } from '@/types/planner'

const col = (uid: string) => collection(db(), 'users', uid, 'tasks')

type FirestoreTaskDoc = Omit<PlannerTask, 'id'> & {
  createdAt?: unknown
  updatedAt?: unknown
}

function toDoc(task: Omit<PlannerTask, 'id'>): FirestoreTaskDoc {
  const cleaned: FirestoreTaskDoc = {
    ...task
  }

  if (cleaned.reminderAt === undefined) {
    delete cleaned.reminderAt
  }
  if (cleaned.timeLabel === undefined) {
    delete cleaned.timeLabel
  }
  if (cleaned.dueNotificationSent === undefined) {
    delete cleaned.dueNotificationSent
  }
  if (cleaned.overdueNotificationSent === undefined) {
    delete cleaned.overdueNotificationSent
  }

  return cleaned
}

function cleanPatch(
  patch: Partial<Omit<PlannerTask, 'id'>>
): Partial<Omit<PlannerTask, 'id'>> {
  return Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined)
  ) as Partial<Omit<PlannerTask, 'id'>>
}

export function subscribeTasks(uid: string, cb: (items: PlannerTask[]) => void): Unsubscribe {
  const q = query(col(uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PlannerTask, 'id'>) })))
  })
}

export async function upsertTask(uid: string, task: PlannerTask): Promise<void> {
  const ref = doc(db(), 'users', uid, 'tasks', task.id)
  const current = await getDoc(ref)
  await setDoc(
    ref,
    {
      ...toDoc({
        title: task.title,
        description: task.description,
        assignedDate: task.assignedDate,
        originalDueDate: task.originalDueDate,
        currentDueDate: task.currentDueDate,
        plannerType: task.plannerType,
        category: task.category,
        priority: task.priority,
        status: task.status,
        reminderAt: task.reminderAt,
        timeLabel: task.timeLabel,
        dueNotificationSent: task.dueNotificationSent ?? false,
        overdueNotificationSent: task.overdueNotificationSent ?? false
      }),
      createdAt: current.exists() ? current.data().createdAt ?? serverTimestamp() : serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  )
}

export async function updateTask(uid: string, id: string, patch: Partial<Omit<PlannerTask, 'id'>>): Promise<void> {
  const ref = doc(db(), 'users', uid, 'tasks', id)
  await updateDoc(ref, {
    ...cleanPatch(patch),
    updatedAt: serverTimestamp()
  })
}

export async function deleteTask(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db(), 'users', uid, 'tasks', id))
}
