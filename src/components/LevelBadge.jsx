import { cn } from '@/lib/utils'

const styles = {
  normal: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
}

const labels = {
  normal: 'Normal',
  orange: 'Alerte Orange',
  red: 'Alerte Rouge',
}

export function LevelBadge({ level, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        styles[level] ?? styles.normal,
        className,
      )}
    >
      {labels[level] ?? level}
    </span>
  )
}
