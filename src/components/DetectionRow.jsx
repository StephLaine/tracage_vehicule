import { LevelBadge } from './LevelBadge'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function DetectionRow({ detection, onDetail, isNew }) {
  return (
    <tr
      className={cn(
        'border-b border-[var(--color-border)] transition-colors hover:bg-white/[0.02]',
        isNew && 'animate-fade-in bg-white/[0.03]',
      )}
    >
      <td className="px-4 py-3">
        <LevelBadge level={detection.level} />
      </td>
      <td className="px-4 py-3 font-mono font-semibold text-white">{detection.plate}</td>
      <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{detection.reason}</td>
      <td className="px-4 py-3 text-sm">Caméra {detection.camera}</td>
      <td className="px-4 py-3 text-sm text-[var(--color-muted)]">
        {formatDateTime(detection.timestamp)}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => onDetail?.(detection)}
          className="text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          Voir détail
        </button>
      </td>
    </tr>
  )
}
