import logoUrl from '@/assets/logo.png'
import { cn } from '@/lib/cn'

type BrandLogoProps = {
  className?: string
  imageClassName?: string
  titleClassName?: string
  subtitleClassName?: string
  stacked?: boolean
  subtitle?: string
}

export function BrandLogo({
  className,
  imageClassName,
  titleClassName,
  subtitleClassName,
  stacked = false,
  subtitle = 'Private planner'
}: BrandLogoProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center gap-3 text-ink-900',
        stacked && 'flex-col items-start gap-2',
        className
      )}
    >
      <img
        src={logoUrl}
        alt="RiddhiDesk kitten logo"
        className={cn(
          'h-[3.3rem] w-[3.3rem] rounded-[1.35rem] object-contain shadow-soft ring-1 ring-paper-200',
          imageClassName
        )}
      />
      <div className="min-w-0">
        <p className={cn('font-display text-2xl font-semibold', titleClassName)}>RiddhiDesk</p>
        <p className={cn('text-xs text-ink-600', subtitleClassName)}>{subtitle}</p>
      </div>
    </div>
  )
}
