import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function CopyableRow({ value, label }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] py-5 last:border-b-0">
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="mt-0.5 text-sm text-[var(--color-muted)]">{label}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-lg p-2 text-white/80 hover:bg-white/5 hover:text-white"
        aria-label={`Copier ${label}`}
      >
        {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
      </button>
    </div>
  )
}
