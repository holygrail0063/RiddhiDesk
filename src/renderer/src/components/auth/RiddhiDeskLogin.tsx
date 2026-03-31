import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, BookOpenCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/shadcn/card'
import { cn } from '@/lib/cn'

type Props = {
  onGoogleSignIn: () => Promise<void>
  loading?: boolean
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
  style
}: {
  accent: 'violet' | 'indigo' | 'fuchsia'
  style?: React.CSSProperties
}): JSX.Element {
  const eyeRef = useRef<HTMLDivElement | null>(null)
  const [pupil, setPupil] = useState({ x: 0, y: 0 })

  useEffect(() => {
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
  }, [])

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

export function RiddhiDeskLogin({
  onGoogleSignIn,
  loading = false,
  error
}: Props): JSX.Element {
  return (
    <div className="min-h-screen bg-paper-50">
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/25 via-purple-500/15 to-sky-500/15" />
          <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-violet-400/25 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="absolute left-16 top-24 h-40 w-40 rounded-[3rem] bg-white/10 blur-sm" />
          <div className="absolute right-14 top-14 h-24 w-24 rounded-3xl bg-white/10 blur-sm" />

          <div className="relative z-10 flex h-full flex-col p-12">
            <div className="flex items-center gap-3 text-ink-900">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/60 shadow-soft ring-1 ring-white/50">
                <BookOpenCheck className="h-5 w-5 text-violet-700" />
              </div>
              <div>
                <p className="font-display text-2xl font-semibold">RiddhiDesk</p>
                <p className="text-xs text-ink-700/70">Private planner</p>
              </div>
            </div>

            <div className="mt-24 max-w-[520px]">
              <h1 className="font-display text-5xl font-semibold leading-[1.1] text-ink-900">
                Track what matters. Finish what you start.
              </h1>
              <p className="text-muted-foreground mt-5 text-base">
                Stay consistent with your actuarial prep
              </p>
            </div>

            <div className="relative mt-20 flex flex-1 items-end justify-center">
              <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-white/10 blur-2xl" />
              <Character accent="violet" style={{ transform: 'translateX(-120px) rotate(-6deg)' }} />
              <Character accent="indigo" style={{ transform: 'translateY(-28px) rotate(4deg)' }} />
              <Character accent="fuchsia" style={{ transform: 'translateX(120px) rotate(-2deg)' }} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-12 lg:px-12">
          <div className="w-full max-w-[420px]">
            <Card className="rounded-3xl shadow-card">
              <CardHeader>
                <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-paper-100 shadow-soft ring-1 ring-paper-200">
                  <BookOpenCheck className="h-6 w-6 text-sage-600" />
                </div>
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
              <p className="font-medium">RiddhiDesk</p>
              <p className="mt-1 text-ink-600">Private planner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

