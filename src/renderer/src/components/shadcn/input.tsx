import * as React from 'react'
import { cn } from '@/lib/cn'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-paper-300 bg-paper-50/70 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/70 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400/35 focus-visible:border-sage-500 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

