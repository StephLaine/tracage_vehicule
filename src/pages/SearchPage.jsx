import { useState } from 'react'
import { Search } from 'lucide-react'
import { TrajectoryTimeline } from '@/components/TrajectoryTimeline'
import { LevelBadge } from '@/components/LevelBadge'
import {
  demoPlates,
  trajectoryByPlate,
  mockDetections,
} from '@/data/mockDetections'
import { formatDateTime } from '@/lib/utils'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)

  const search = (plate) => {
    const normalized = plate.trim().toUpperCase()
    const demo = demoPlates.find((p) => p.plate === normalized)
    const passages = mockDetections.filter((d) => d.plate === normalized)
    const trajectory = trajectoryByPlate[normalized]

    if (!demo && !passages.length) {
      setResult({ found: false, plate: normalized })
      return
    }

    setResult({
      found: true,
      plate: normalized,
      status: demo?.status ?? 'Normale',
      passages: demo?.passages ?? passages.length,
      trajectory: trajectory ?? passages.slice(0, 3).map((p) => ({
        camera: p.camera,
        location: p.cameraLocation,
        timestamp: p.timestamp,
      })),
      details: passages.length ? passages : mockDetections.slice(0, 3),
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    search(query)
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une plaque (ex : HT-2245-XY)"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3.5 pl-12 pr-4 font-mono text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-6 font-semibold text-white hover:bg-emerald-500"
        >
          Rechercher
        </button>
      </form>

      {!result && (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <h2 className="text-xl font-bold text-white">Recherche de trajectoire</h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Entrez une plaque pour visualiser son parcours entre les caméras.
          </p>
          <p className="mt-6 text-sm text-[var(--color-muted)]">Plaques de démo :</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {demoPlates.map((p) => (
              <button
                key={p.plate}
                type="button"
                onClick={() => {
                  setQuery(p.plate)
                  search(p.plate)
                }}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 font-mono text-sm text-white hover:border-emerald-500/40"
              >
                {p.plate}
              </button>
            ))}
          </div>
        </div>
      )}

      {result && !result.found && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <p className="font-mono text-lg font-bold text-white">{result.plate}</p>
          <p className="mt-2 text-[var(--color-muted)]">Aucun passage enregistré pour cette plaque.</p>
        </div>
      )}

      {result?.found && (
        <>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <p className="font-mono text-3xl font-bold text-white">{result.plate}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Plaque recherchée</p>
            <div className="mt-4 flex flex-wrap gap-6">
              <div>
                <p className="text-lg font-semibold text-white">{result.status}</p>
                <p className="text-sm text-[var(--color-muted)]">Statut</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{result.passages}</p>
                <p className="text-sm text-[var(--color-muted)]">Passages enregistrés</p>
              </div>
            </div>
          </div>

          <TrajectoryTimeline passages={result.trajectory} />

          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-xs uppercase text-[var(--color-muted)]">
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Caméra</th>
                  <th className="px-4 py-3">Horodatage</th>
                  <th className="px-4 py-3">Confiance</th>
                  <th className="px-4 py-3">Niveau</th>
                </tr>
              </thead>
              <tbody>
                {result.details.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--color-border)]">
                    <td className="px-4 py-3">
                      <img
                        src={row.imageUrl}
                        alt=""
                        className="h-12 w-20 rounded object-cover"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">Caméra {row.camera}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-muted)]">
                      {formatDateTime(row.timestamp)}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">
                      {Math.round(row.confidence * 100)} %
                    </td>
                    <td className="px-4 py-3">
                      <LevelBadge level={row.level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
