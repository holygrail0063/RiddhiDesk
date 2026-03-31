import { AccountMenu } from '@/components/layout/AccountMenu'

export function AppHeader(): JSX.Element {
  return (
    <header className="flex h-14 shrink-0 items-center justify-end border-b border-paper-200 bg-paper-50/95 px-6 backdrop-blur lg:px-8">
      <AccountMenu />
    </header>
  )
}
