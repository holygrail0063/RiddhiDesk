import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Input({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>): JSX.Element {
  return (
    <input
      className={`w-full rounded-xl border border-paper-300 bg-paper-50 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-400/30 ${className}`}
      {...rest}
    />
  )
}

export function TextArea({
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>): JSX.Element {
  return (
    <textarea
      className={`w-full min-h-[120px] rounded-xl border border-paper-300 bg-paper-50 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-400/30 ${className}`}
      {...rest}
    />
  )
}
