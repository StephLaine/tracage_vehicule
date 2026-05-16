import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function CameraStatusCard({ camera }) {
  const online = camera.status === 'online'

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{camera.name}</h3>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">{camera.location}</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium">
          <span
            className={cn('h-2 w-2 rounded-full', online ? 'bg-emerald-400' : 'bg-red-400')}
          />
          <span className={online ? 'text-emerald-400' : 'text-red-400'}>
            {online ? 'En ligne' : 'Hors ligne'}
          </span>
        </span>
      </div>
      <div className="mt-4 border-t border-[var(--color-border)] pt-4">
        <p className="font-mono text-lg font-semibold text-white">
          {camera.lastDetection.plate}
        </p>
        <p className="text-sm text-[var(--color-muted)]">Dernière plaque détectée</p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          {formatDateTime(camera.lastDetection.at)}
        </p>
      </div>
    </div>
  )
}
