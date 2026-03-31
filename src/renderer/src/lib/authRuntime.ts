export type AuthRuntime = 'web' | 'electron'

export function getAuthRuntime(): AuthRuntime {
  return typeof window !== 'undefined' && window.riddhiDesk ? 'electron' : 'web'
}

export function isElectronRuntime(): boolean {
  return getAuthRuntime() === 'electron'
}
