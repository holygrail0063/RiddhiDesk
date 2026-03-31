const STORAGE_KEY = 'riddhidesk:notifyState:v2'

type State = {
  taskDue: Record<string, true>
  taskOverdue: Record<string, true>
}

function read(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { taskDue: {}, taskOverdue: {} }
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { taskDue: {}, taskOverdue: {} }
    }
    const o = parsed as Partial<State>
    return {
      taskDue: o.taskDue && typeof o.taskDue === 'object' ? o.taskDue : {},
      taskOverdue: o.taskOverdue && typeof o.taskOverdue === 'object' ? o.taskOverdue : {}
    }
  } catch {
    return { taskDue: {}, taskOverdue: {} }
  }
}

function write(s: State): void {
  const prune = (m: Record<string, true>, max: number) => {
    const keys = Object.keys(m)
    if (keys.length <= max) return m
    keys.sort()
    const next = { ...m }
    for (let i = 0; i < keys.length - max; i++) {
      delete next[keys[i]]
    }
    return next
  }
  const next: State = {
    taskDue: prune(s.taskDue, 400),
    taskOverdue: prune(s.taskOverdue, 400)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

function key(taskId: string, dueEpoch: number): string {
  return `${taskId}:${dueEpoch}`
}

export function isTaskDueSent(taskId: string, dueEpoch: number): boolean {
  return !!read().taskDue[key(taskId, dueEpoch)]
}

export function markTaskDueSent(taskId: string, dueEpoch: number): void {
  const s = read()
  s.taskDue[key(taskId, dueEpoch)] = true
  write(s)
}

export function isTaskOverdueSent(taskId: string, dueEpoch: number): boolean {
  return !!read().taskOverdue[key(taskId, dueEpoch)]
}

export function markTaskOverdueSent(taskId: string, dueEpoch: number): void {
  const s = read()
  s.taskOverdue[key(taskId, dueEpoch)] = true
  write(s)
}
