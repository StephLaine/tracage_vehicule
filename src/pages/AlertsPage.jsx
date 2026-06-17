import { useMemo, useState } from 'react'
import { LevelBadge } from '@/components/LevelBadge'
import { Modal } from '@/components/Modal'
import { CopyableRow } from '@/components/CopyableRow'
import { formatDateTime } from '@/lib/utils'
import { useLiveFeed } from '@/hooks/useLiveFeed'

const PAGE_SIZE = 10

const statusLabels = {
  new: 'Nouvelle',
  validated: 'Traitée',
  false_positive: 'Faux positif',
}

export function AlertsPage() {
  const [level, setLevel] = useState('all')
  const [camera, setCamera] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  
  const { allDetections } = useLiveFeed()
  const [alertStatuses, setAlertStatuses] = useState(() => {
    const saved = localStorage.getItem('alert_statuses')
    return saved ? JSON.parse(saved) : {}
  })

  const updateAlertStatus = (detectionId, newStatus) => {
    setAlertStatuses((prev) => {
      const next = { ...prev, [detectionId]: newStatus }
      localStorage.setItem('alert_statuses', JSON.stringify(next))
      return next
    })
    setSelected(null)
  }

  const alerts = useMemo(() => {
    return allDetections
      .filter((d) => d.level !== 'normal')
      .map((det) => ({
        id: `alert-${det.id}`,
        detectionId: det.id,
        plate: det.plate,
        level: det.level,
        reason: det.reason,
        camera: det.camera,
        cameraLocation: det.cameraLocation,
        timestamp: det.timestamp,
        confidence: det.confidence,
        imageUrl: det.imageUrl,
        status: alertStatuses[det.id] || 'new',
      }))
  }, [allDetections, alertStatuses])

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (level !== 'all' && a.level !== level) return false
      if (camera !== 'all' && a.camera !== camera) return false
      if (status !== 'all' && a.status !== status) return false
      return true
    })
  }, [alerts, level, camera, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const selectClass =
    'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1) }} className={selectClass}>
          <option value="all">Tous les niveaux</option>
          <option value="orange">Orange</option>
          <option value="red">Rouge</option>
        </select>
        <select value={camera} onChange={(e) => { setCamera(e.target.value); setPage(1) }} className={selectClass}>
          <option value="all">Toutes les caméras</option>
          <option value="A">Caméra A</option>
          <option value="B">Caméra B</option>
          <option value="C">Caméra C</option>
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className={selectClass}>
          <option value="all">Tous les statuts</option>
          <option value="new">Nouvelles</option>
          <option value="validated">Traitées</option>
          <option value="false_positive">Faux positifs</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs uppercase text-[var(--color-muted)]">
              <th className="px-4 py-3">Niveau</th>
              <th className="px-4 py-3">Plaque</th>
              <th className="px-4 py-3">Motif</th>
              <th className="px-4 py-3">Caméra</th>
              <th className="px-4 py-3">Horodatage</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((alert) => (
              <tr
                key={alert.id}
                onClick={() => setSelected(alert)}
                className="cursor-pointer border-b border-[var(--color-border)] hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <LevelBadge level={alert.level} />
                </td>
                <td className="px-4 py-3 font-mono font-semibold">{alert.plate}</td>
                <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{alert.reason}</td>
                <td className="px-4 py-3 text-sm">Caméra {alert.camera}</td>
                <td className="px-4 py-3 text-sm text-[var(--color-muted)]">
                  {formatDateTime(alert.timestamp)}
                </td>
                <td className="px-4 py-3 text-sm">{statusLabels[alert.status]}</td>
                <td className="px-4 py-3 text-right text-sm text-[var(--color-accent)]">
                  Voir
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
                  Aucune alerte trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-muted)]">
          Page {page} sur {totalPages} · {filtered.length} alertes
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Précédent
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Détail de l'alerte"
        wide
      >
        {selected && (
          <div>
            <img
              src={selected.imageUrl}
              alt={selected.plate}
              className="mb-6 w-full rounded-xl object-cover"
            />
            <CopyableRow value={selected.plate} label="Plaque lue" />
            <CopyableRow
              value={`${Math.round(selected.confidence * 100)} %`}
              label="Score de confiance"
            />
            <CopyableRow
              value={`Caméra ${selected.camera} — ${selected.cameraLocation}`}
              label="Caméra et localisation"
            />
            <CopyableRow value={formatDateTime(selected.timestamp)} label="Horodatage" />
            <CopyableRow value={selected.reason} label="Motif détaillé" />
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => updateAlertStatus(selected.detectionId, 'validated')}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
              >
                Valider l'alerte
              </button>
              <button
                type="button"
                onClick={() => updateAlertStatus(selected.detectionId, 'false_positive')}
                className="rounded-lg border border-orange-500/40 px-4 py-2 text-sm text-orange-400 hover:bg-orange-500/10"
              >
                Marquer comme faux positif
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)]"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
