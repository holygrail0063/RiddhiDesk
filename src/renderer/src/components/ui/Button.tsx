import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const styles: Record<Variant, string> = {
  primary:
    'bg-sage-600 text-white hover:bg-sage-500 shadow-soft focus:ring-sage-400',
  secondary:
    'bg-paper-200 text-ink-900 hover:bg-paper-300 border border-paper-300',
  ghost: 'bg-transparent text-ink-700 hover:bg-paper-200',
  danger: 'bg-red-600 text-white hover:bg-red-500'
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}): JSX.Element {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
