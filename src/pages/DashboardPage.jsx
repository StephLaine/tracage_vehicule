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

export function DashboardPage() {
  const [toast, setToast] = useState(null)
  const [detail, setDetail] = useState(null)

  const { detections, newIds } = useLiveFeed((det) => {
    setToast({ message: 'Alerte Rouge détectée', plate: det.plate })
    setTimeout(() => setToast(null), 5000)
  })

  const todayCount = mockDetections.filter(
    (d) => d.timestamp.toDateString() === new Date().toDateString(),
  ).length
  const uniquePlates = new Set(mockDetections.map((d) => d.plate)).size
  const orangeCount = mockDetections.filter((d) => d.level === 'orange').length
  const redCount = mockDetections.filter((d) => d.level === 'red').length

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
        <h2 className="mb-4 text-lg font-semibold text-white">État des caméras</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {mockCameras.map((cam) => (
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
            <img
              src={detail.imageUrl}
              alt={`Plaque ${detail.plate}`}
              className="mb-6 w-full rounded-xl object-cover"
            />
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
