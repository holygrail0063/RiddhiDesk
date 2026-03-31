export function toYmd(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function fromYmd(ymd: string): Date {
  const [y, m, day] = ymd.split('-').map(Number)
  return new Date(y, m - 1, day, 12, 0, 0, 0)
}

export function addDaysYmd(ymd: string, n: number): string {
  const d = fromYmd(ymd)
  d.setDate(d.getDate() + n)
  return toYmd(d)
}

export function diffDays(aYmd: string, bYmd: string): number {
  const a = fromYmd(aYmd).getTime()
  const b = fromYmd(bYmd).getTime()
  return Math.round((a - b) / (1000 * 60 * 60 * 24))
}

export function isPast(ymd: string): boolean {
  const d = fromYmd(ymd)
  const now = new Date()
  const n = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0)
  return d.getTime() < n.getTime()
}

export function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function startOfMonthGrid(base: Date): Date {
  const first = new Date(base.getFullYear(), base.getMonth(), 1, 12, 0, 0, 0)
  const day = first.getDay() // 0 Sun
  const start = new Date(first)
  start.setDate(first.getDate() - day)
  return start
}

