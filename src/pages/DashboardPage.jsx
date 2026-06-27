import { useState } from 'react'
import { MetricCard } from '@/components/MetricCard'
import { CameraStatusCard } from '@/components/CameraStatusCard'
import { DetectionRow } from '@/components/DetectionRow'
import { Modal } from '@/components/Modal'
import { Toast } from '@/components/Toast'
import { LevelBadge } from '@/components/LevelBadge'
import { CopyableRow } from '@/components/CopyableRow'
import { mockCameras } from '@/data/mockCameras'
import { mockDetections } from '@/data/mockDetections'
import { useLiveFeed } from '@/hooks/useLiveFeed'
import { formatDateTime } from '@/lib/utils'
import { seedDetections } from '@/lib/api'

export function DashboardPage() {
  const [toast, setToast] = useState(null)
  const [detail, setDetail] = useState(null)
  const [seeding, setSeeding] = useState(false)

  const { detections, allDetections, newIds, refresh } = useLiveFeed((det) => {
    setToast({ message: 'Alerte Rouge détectée', plate: det.plate })
    setTimeout(() => setToast(null), 5000)
  })

  const handleSeed = async () => {
    try {
      setSeeding(true)
      await seedDetections(mockDetections.slice(0, 15))
      setToast({ message: 'Simulations de passage injectées avec succès', plate: 'API' })
      setTimeout(() => setToast(null), 4000)
      refresh()
    } catch (err) {
      console.error(err)
      setToast({ message: 'Erreur lors de l\'injection des simulations', plate: 'FAIL' })
      setTimeout(() => setToast(null), 4000)
    } finally {
      setSeeding(false)
    }
  }

  const todayCount = allDetections.filter(
    (d) => d.timestamp.toDateString() === new Date().toDateString(),
  ).length
  const uniquePlates = new Set(allDetections.map((d) => d.plate)).size
  const orangeCount = allDetections.filter((d) => d.level === 'orange').length
  const redCount = allDetections.filter((d) => d.level === 'red').length

  const cameras = mockCameras.map((cam) => {
    const camDets = allDetections.filter((d) => d.camera === cam.code)
    const lastDet = camDets[0]
    const todayCamDets = camDets.filter(
      (d) => d.timestamp.toDateString() === new Date().toDateString()
    )

    return {
      ...cam,
      lastDetection: lastDet ? { plate: lastDet.plate, at: lastDet.timestamp } : cam.lastDetection,
      todayCount: todayCamDets.length,
    }
  })

  return (
    <div className="space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          plate={toast.plate}
          onClose={() => setToast(null)}
        />
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Détections aujourd'hui" value={todayCount} />
        <MetricCard label="Véhicules uniques" value={uniquePlates} />
        <MetricCard label="Alertes Orange (en cours)" value={orangeCount} accent="orange" />
        <MetricCard label="Alertes Rouge (en cours)" value={redCount} accent="red" />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">État des caméras</h2>
          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {seeding ? 'Injection...' : 'Injecter 15 passages simulés'}
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {cameras.map((cam) => (
            <CameraStatusCard key={cam.id} camera={cam} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Flux temps réel</h2>
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="px-4 py-3 font-medium">Niveau</th>
                <th className="px-4 py-3 font-medium">Plaque</th>
                <th className="px-4 py-3 font-medium">Motif</th>
                <th className="px-4 py-3 font-medium">Caméra</th>
                <th className="px-4 py-3 font-medium">Horodatage</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {detections.map((det) => (
                <DetectionRow
                  key={det.id}
                  detection={det}
                  isNew={newIds.has(det.id)}
                  onDetail={setDetail}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title="Détail de la détection"
        wide
      >
        {detail && (
          <div>
            <div className="mb-6 flex items-center justify-center rounded-xl bg-[#0d1117] py-8">
              <svg
                viewBox="0 0 340 120"
                width="340"
                height="120"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-xl"
              >
                {/* Plate body */}
                <rect x="4" y="4" width="332" height="112" rx="10" ry="10" fill="#f5f0dc" stroke="#1a3a8f" strokeWidth="6" />
                {/* Inner border */}
                <rect x="12" y="12" width="316" height="96" rx="6" ry="6" fill="none" stroke="#1a3a8f" strokeWidth="2" />
                {/* Country label */}
                <text x="170" y="36" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="13" fill="#1a3a8f" letterSpacing="4">
                  HAITI
                </text>
                {/* Plate number */}
                <text x="170" y="85" textAnchor="middle" fontFamily="'Courier New', monospace" fontWeight="bold" fontSize="38" fill="#111" letterSpacing="3">
                  {detail.plate}
                </text>
              </svg>
            </div>
            <LevelBadge level={detail.level} className="mb-4" />
            <CopyableRow value={detail.plate} label="Plaque d'immatriculation" />
            <CopyableRow
              value={`${Math.round(detail.confidence * 100)} %`}
              label="Score de confiance"
            />
            <CopyableRow
              value={`Caméra ${detail.camera} — ${detail.cameraLocation}`}
              label="Caméra et localisation"
            />
            <CopyableRow value={formatDateTime(detail.timestamp)} label="Horodatage" />
            <CopyableRow value={detail.reason} label="Motif" />
          </div>
        )}
      </Modal>
    </div>
  )
}
