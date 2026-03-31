import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/shadcn/card'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { cn } from '@/lib/cn'

type Props = {
  onGoogleSignIn: () => Promise<void>
  loading?: boolean
  info?: string | null
  error?: string | null
}

function GoogleMark({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function Character({
  accent,
  style,
  reducedMotion = false
}: {
  accent: 'violet' | 'indigo' | 'fuchsia'
  style?: React.CSSProperties
  reducedMotion?: boolean
}): JSX.Element {
  const eyeRef = useRef<HTMLDivElement | null>(null)
  const [pupil, setPupil] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (reducedMotion) {
      setPupil({ x: 0, y: 0 })
      return
    }

    const onMove = (e: MouseEvent) => {
      const el = eyeRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const mag = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 220)
      setPupil({ x: (dx / 40) * mag, y: (dy / 40) * mag })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [reducedMotion])

  const colors = useMemo(() => {
    const map = {
      violet: 'from-violet-200/80 to-purple-200/40',
      indigo: 'from-indigo-200/80 to-sky-200/40',
      fuchsia: 'from-fuchsia-200/80 to-rose-200/40'
    } as const
    return map[accent]
  }, [accent])

  return (
    <div
      className={cn(
        'relative h-40 w-40 rounded-[2.25rem] bg-gradient-to-br shadow-soft ring-1 ring-white/40',
        colors
      )}
      style={style}
    >
      <div className="absolute left-1/2 top-10 h-9 w-16 -translate-x-1/2 rounded-full bg-white/70 backdrop-blur" />
      <div
        ref={eyeRef}
        className="absolute left-1/2 top-[2.55rem] flex -translate-x-1/2 items-center gap-3"
      >
        {([0, 1] as const).map((i) => (
          <div
            key={i}
            className="relative h-7 w-7 rounded-full bg-white shadow-sm"
          >
            <div
              className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-900"
              style={{
                transform: `translate(calc(-50% + ${pupil.x}px), calc(-50% + ${pupil.y}px))`
              }}
            />
            <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-white/90" />
          </div>
        ))}
      </div>
      <div className="absolute left-1/2 top-[4.45rem] h-2 w-10 -translate-x-1/2 rounded-full bg-ink-900/20" />
      <div className="absolute inset-x-6 bottom-6 h-10 rounded-2xl bg-white/40" />
    </div>
  )
}

function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(media.matches)

    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return reducedMotion
}

export function RiddhiDeskLogin({
  onGoogleSignIn,
  loading = false,
  info,
  error
}: Props): JSX.Element {
  const reducedMotion = useReducedMotion()

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-500/10 to-sky-400/14" />
        <div className="absolute inset-y-0 left-[-12%] w-[42%] rounded-full bg-violet-300/18 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[8%] h-[34rem] w-[34rem] rounded-full bg-fuchsia-300/14 blur-3xl" />
        <div className="absolute left-[10%] top-[8%] h-40 w-40 rounded-[3rem] bg-white/16 blur-sm" />
        <div className="absolute left-[22%] top-[14%] h-28 w-28 rounded-3xl bg-white/12 blur-sm" />
        <div className="absolute bottom-[8%] left-[24%] h-32 w-32 rounded-full bg-sky-200/15 blur-2xl" />
        <div className="absolute left-[6%] top-[14%] hidden h-[22rem] w-[32rem] rounded-[3rem] bg-paper-50/58 blur-2xl lg:block xl:left-[10%] xl:w-[36rem]" />
        <div className="absolute left-[50%] top-[50%] hidden h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper-50/44 blur-3xl lg:block" />
        <div className="absolute right-[3%] top-[10%] hidden h-[80%] w-[34rem] rounded-[3rem] bg-paper-50/82 blur-2xl lg:block xl:w-[38rem]" />
        <div className="absolute inset-x-6 bottom-4 h-40 rounded-[3rem] bg-gradient-to-t from-white/30 to-transparent blur-3xl sm:inset-x-10 lg:inset-x-16" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1680px] grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(420px,560px)]">
        <div className="relative hidden min-h-screen overflow-hidden lg:block">
          <div className="relative z-10 flex h-full flex-col justify-between px-12 py-12 xl:px-16 xl:py-14 2xl:px-20">
            <BrandLogo
              imageClassName="h-14 w-14 rounded-[1.5rem] bg-white/70 p-1 ring-white/60"
              subtitleClassName="text-ink-700/70"
            />

            <div className="max-w-[560px] pt-10 xl:pt-16">
              <h1 className="font-display text-5xl font-semibold leading-[1.1] text-ink-900 xl:text-6xl">
                Track what matters. Finish what you start.
              </h1>
              <p className="text-muted-foreground mt-5 max-w-[440px] text-base xl:text-lg">
                Stay consistent with your actuarial prep
              </p>
            </div>

            <div className="relative flex min-h-[320px] items-end justify-center xl:min-h-[380px]">
              <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-white/10 blur-2xl" />
              <Character
                accent="violet"
                reducedMotion={reducedMotion}
                style={{ transform: 'translateX(-120px) rotate(-6deg)' }}
              />
              <Character
                accent="indigo"
                reducedMotion={reducedMotion}
                style={{ transform: 'translateY(-28px) rotate(4deg)' }}
              />
              <Character
                accent="fuchsia"
                reducedMotion={reducedMotion}
                style={{ transform: 'translateX(120px) rotate(-2deg)' }}
              />
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center px-5 py-12 sm:px-6 lg:px-10 xl:px-16">
          <div className="relative w-full max-w-[440px]">
            <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-white/25 blur-2xl sm:-inset-6" />
            <Card className="relative rounded-3xl bg-white/90 shadow-card backdrop-blur">
              <CardHeader>
                <BrandLogo
                  className="mb-6"
                  imageClassName="h-14 w-14 bg-paper-100 p-1"
                  titleClassName="text-xl"
                  subtitleClassName="hidden"
                />
                <CardTitle>Welcome to RiddhiDesk</CardTitle>
                <CardDescription>
                  Sign in with the approved Google account to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div
                    role="alert"
                    className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
                  >
                    {error}
                  </div>
                )}
                {info && !error && (
                  <div className="mb-4 rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-900">
                    {info}
                  </div>
                )}
                <Button
                  className="w-full justify-between"
                  onClick={() => void onGoogleSignIn()}
                  disabled={loading}
                >
                  <span className="inline-flex items-center gap-2">
                    <GoogleMark className="h-5 w-5" />
                    {loading ? 'Signing in…' : 'Continue with Google'}
                  </span>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin opacity-90" />
                  ) : (
                    <ArrowRight className={cn('h-4 w-4 opacity-90')} />
                  )}
                </Button>
                <p className="mt-4 text-center text-xs text-ink-600">
                  Only authorized users can access this planner
                </p>
              </CardContent>
            </Card>

            <div className="mt-6 rounded-2xl border border-paper-200 bg-white/70 p-4 text-xs text-ink-700 shadow-soft lg:hidden">
              <BrandLogo
                imageClassName="h-12 w-12 bg-paper-100 p-1"
                titleClassName="text-base"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

