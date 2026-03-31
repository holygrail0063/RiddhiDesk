import type { HTMLAttributes, ReactNode } from 'react'

export function Card({
  children,
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }): JSX.Element {
  return (
    <div
      className={`rounded-2xl border border-paper-200 bg-white/90 p-5 shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
