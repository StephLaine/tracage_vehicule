import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Bell,
  Search,
  ListOrdered,
  Cctv,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/alerts', label: 'Alertes', icon: Bell },
  { to: '/search', label: 'Recherche', icon: Search },
  { to: '/plates', label: 'Plaques signalées', icon: ListOrdered },
  { to: '/cameras', label: 'Caméras', icon: Cctv },
]

export function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
          <Shield className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <p className="font-bold text-white">Tracage ALPR</p>
          <p className="text-xs text-[var(--color-muted)]">Port-au-Prince</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-[var(--color-muted)] hover:bg-white/5 hover:text-white',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
