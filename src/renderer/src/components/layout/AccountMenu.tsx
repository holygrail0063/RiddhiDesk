import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, LogOut, UserCircle2 } from 'lucide-react'
import { useAuth } from '@/store/authContext'
import { cn } from '@/lib/cn'

export function AccountMenu(): JSX.Element {
  const { user, signOutApp } = useAuth()

  const handleLogout = (): void => {
    void signOutApp()
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-10 items-center gap-2 rounded-2xl border border-paper-200 bg-white/90 px-2.5 py-1.5 text-sm font-medium text-ink-800 shadow-soft transition hover:bg-paper-100 focus:outline-none focus:ring-2 focus:ring-sage-400/40'
          )}
          aria-label="Account menu"
        >
          <UserCircle2 className="h-6 w-6 shrink-0 text-ink-700" />
          <ChevronDown className="h-4 w-4 shrink-0 text-ink-500" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-[100] min-w-[240px] rounded-2xl border border-paper-200 bg-paper-50 p-1 shadow-card"
          sideOffset={8}
          align="end"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="px-3 py-2">
            {user?.displayName ? (
              <p className="truncate text-sm font-semibold text-ink-900">{user.displayName}</p>
            ) : (
              <p className="text-sm font-medium text-ink-600">Signed in</p>
            )}
            {user?.email ? (
              <p className="mt-0.5 truncate text-xs text-ink-500">{user.email}</p>
            ) : null}
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-paper-200" />
          <DropdownMenu.Item
            className="cursor-pointer rounded-xl px-3 py-2 text-sm text-ink-800 outline-none hover:bg-paper-200/80 focus:bg-paper-200/80"
            onSelect={(e) => {
              e.preventDefault()
              handleLogout()
            }}
          >
            <span className="inline-flex items-center gap-2">
              <LogOut className="h-4 w-4 text-ink-600" />
              Logout
            </span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
