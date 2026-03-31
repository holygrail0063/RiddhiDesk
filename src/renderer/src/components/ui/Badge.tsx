import type { ReactNode } from 'react'

export function Badge({
  children,
  tone = 'neutral'
}: {
  children: ReactNode
  tone?: 'neutral' | 'sage' | 'blush' | 'warn'
}): JSX.Element {
  const map = {
    neutral: 'bg-paper-200 text-ink-700',
    sage: 'bg-sage-400/25 text-sage-600',
    blush: 'bg-blush-400/25 text-blush-500',
    warn: 'bg-amber-100 text-amber-900'
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[tone]}`}
    >
      {children}
    </span>
  )
}
