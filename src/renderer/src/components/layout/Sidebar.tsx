import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/notes', label: 'Notes' },
  { to: '/deadlines', label: 'Deadlines / Dues' },
  { to: '/plans', label: 'Future Plans' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/settings', label: 'Settings' }
]

export function Sidebar(): JSX.Element {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-paper-200 bg-paper-100/80 px-3 py-6">
      <div className="mb-8 px-2">
        <p className="font-display text-xl font-semibold text-ink-900">RiddhiDesk</p>
        <p className="mt-1 text-xs text-ink-500">Study &amp; planning</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-white text-sage-600 shadow-soft'
                  : 'text-ink-600 hover:bg-paper-200/80'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
