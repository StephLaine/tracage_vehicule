import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useClock } from '@/hooks/useClock'

export function Navbar({ title }) {
  const time = useClock()
  const navigate = useNavigate()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)] px-6">
      <h1 className="text-xl font-bold text-white">{title}</h1>
      <div className="flex items-center gap-6">
        <span className="font-mono text-sm text-[var(--color-muted)]">{time}</span>
        <span className="text-sm text-white">
          <span className="text-[var(--color-muted)]">Opérateur · </span>
          Agent Dubois
        </span>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-muted)] transition-colors hover:border-white/20 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </header>
  )
}
