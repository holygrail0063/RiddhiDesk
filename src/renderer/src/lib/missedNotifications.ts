const STORAGE_KEY = 'riddhidesk:missedNotifications:v1'
const MAX_ITEMS = 50

export type MissedKind = 'task_due' | 'task_overdue' | 'reminder'

export type MissedItem = {
  id: string
  kind: MissedKind
  refId: string
  title: string
  detail: string
  at: string
}

function dedupeKey(kind: MissedKind, refId: string, at: string): string {
  return `${kind}:${refId}:${at}`
}

function read(): MissedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { items?: MissedItem[] }
    return Array.isArray(parsed.items) ? parsed.items : []
  } catch {
    return []
  }
}

function write(items: MissedItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }))
  window.dispatchEvent(new CustomEvent('riddhidesk:missed-updated'))
}

export function loadMissedNotifications(): MissedItem[] {
  return read()
}

export function pushMissedNotifications(
  incoming: Omit<MissedItem, 'id'>[],
  maxPerBatch = 5
): void {
  if (incoming.length === 0) return
  const existing = read()
  const seen = new Set(existing.map((x) => dedupeKey(x.kind, x.refId, x.at)))
  const next = [...existing]
  let added = 0
  for (const item of incoming) {
    if (added >= maxPerBatch) break
    const k = dedupeKey(item.kind, item.refId, item.at)
    if (seen.has(k)) continue
    seen.add(k)
    next.unshift({
      ...item,
      id: `m_${Date.now().toString(36)}_${Math.random().toString(16).slice(2)}`
    })
    added++
  }
  while (next.length > MAX_ITEMS) {
    next.pop()
  }
  write(next)
}

export function dismissMissedNotification(id: string): void {
  const next = read().filter((x) => x.id !== id)
  write(next)
}

export function clearMissedNotifications(): void {
  write([])
}
