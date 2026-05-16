import { cn } from '@/lib/utils'

export function MetricCard({ label, value, accent }) {
  const accentClass = {
    normal: 'text-emerald-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    default: 'text-white',
  }[accent ?? 'default']

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <p className={cn('text-3xl font-bold tracking-tight', accentClass)}>{value}</p>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{label}</p>
    </div>
  )
}
