import { NavLink } from 'react-router-dom'
import { BrandLogo } from '@/components/ui/BrandLogo'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/planner', label: 'Planner' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/reminders', label: 'Reminders' },
  { to: '/completed', label: 'Completed' },
  { to: '/needs-replan', label: 'Needs Replan' },
  { to: '/settings', label: 'Settings' }
]

export function Sidebar(): JSX.Element {
  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-paper-200 bg-paper-100/80 px-3 py-6">
      <div className="mb-8 px-2">
        <BrandLogo
          imageClassName="h-14 w-14 rounded-[1.5rem] bg-white p-1"
          titleClassName="text-xl"
          subtitle="Planner • tasks • timelines"
        />
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
