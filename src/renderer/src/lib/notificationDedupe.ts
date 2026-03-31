const STORAGE_KEY = 'riddhidesk:notified:v1'

function readMap(): Record<string, true> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, true>
    }
    return {}
  } catch {
    return {}
  }
}

function writeMap(m: Record<string, true>): void {
  const keys = Object.keys(m)
  const max = 500
  if (keys.length > max) {
    keys.sort()
    for (let i = 0; i < keys.length - max; i++) {
      delete m[keys[i]]
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(m))
}

const sessionSeen = new Set<string>()

export function hasNotified(key: string): boolean {
  if (sessionSeen.has(key)) return true
  const m = readMap()
  return !!m[key]
}

export function markNotified(key: string): void {
  sessionSeen.add(key)
  const m = readMap()
  m[key] = true
  writeMap(m)
}
