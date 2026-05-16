import { formatDateTime } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { Fragment } from 'react'

export function TrajectoryTimeline({ passages }) {
  if (!passages?.length) return null

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h3 className="mb-6 text-sm font-medium text-[var(--color-muted)]">
        Trajectoire estimée
      </h3>
      <div className="flex min-w-max items-center gap-2">
        {passages.map((step, i) => (
          <Fragment key={`${step.camera}-${i}`}>
            <div className="flex min-w-[140px] flex-col items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-4">
              <span className="text-lg font-bold text-white">Caméra {step.camera}</span>
              <span className="mt-1 text-center text-xs text-[var(--color-muted)]">
                {step.location}
              </span>
              <span className="mt-2 text-xs text-[var(--color-muted)]">
                {formatDateTime(step.timestamp)}
              </span>
            </div>
            {i < passages.length - 1 && (
              <ArrowRight className="h-5 w-5 shrink-0 text-[var(--color-muted)]" />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
