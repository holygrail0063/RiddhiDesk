import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { UserProfile } from '@/types'

const PROFILE_DOC = 'main'

export async function ensureProfile(
  uid: string,
  displayName: string | null,
  email: string | null
): Promise<UserProfile> {
  const ref = doc(db(), 'users', uid, 'profile', PROFILE_DOC)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    return snap.data() as UserProfile
  }
  const profile: UserProfile = {
    displayName,
    email,
    createdAt: Timestamp.now()
  }
  await setDoc(ref, profile)
  return profile
}
