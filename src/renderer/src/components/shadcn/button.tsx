import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-paper-50',
  {
    variants: {
      variant: {
        default: 'bg-sage-600 text-white hover:bg-sage-500 shadow-soft',
        secondary:
          'bg-paper-100 text-ink-900 hover:bg-paper-200 border border-paper-200',
        outline:
          'border border-paper-300 bg-white/70 text-ink-900 hover:bg-paper-100',
        ghost: 'bg-transparent text-ink-700 hover:bg-paper-100',
        destructive: 'bg-red-600 text-white hover:bg-red-500'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-xl px-3',
        lg: 'h-11 rounded-2xl px-6',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

