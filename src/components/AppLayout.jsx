import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

const titles = {
  '/': 'Tableau de bord',
  '/alerts': 'Alertes',
  '/search': 'Recherche & Historique',
  '/plates': 'Plaques signalées',
  '/cameras': 'Caméras',
}

export function AppLayout() {
  const { pathname } = useLocation()
  const title = titles[pathname] ?? 'Tracage ALPR'

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar title={title} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
