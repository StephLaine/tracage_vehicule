import { X, AlertTriangle } from 'lucide-react'

export function Toast({ message, plate, onClose }) {
  return (
    <div className="animate-slide-in fixed right-4 top-4 z-[100] flex max-w-sm items-start gap-3 rounded-xl border border-red-500/40 bg-[var(--color-surface-elevated)] p-4 shadow-xl">
      <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
      <div className="flex-1">
        <p className="font-semibold text-white">{message}</p>
        {plate && (
          <p className="mt-1 font-mono text-sm text-red-300">{plate}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-[var(--color-muted)] hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
