import { useEffect, useState } from 'react'
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
import { seedDetections, fetchCameras, normalizeCameraCode } from '@/lib/api'

export function DashboardPage() {
  const [toast, setToast] = useState(null)
  const [detail, setDetail] = useState(null)
  const [activeCameraCodes, setActiveCameraCodes] = useState([])
  const [seeding, setSeeding] = useState(false)

  const { detections, allDetections, newIds, refresh } = useLiveFeed((det) => {
    setToast({ message: 'Alerte Rouge détectée', plate: det.plate })
    setTimeout(() => setToast(null), 5000)
  })

  useEffect(() => {
    const loadActive = async () => {
      const active = await fetchCameras()
      setActiveCameraCodes(active)
    }
    loadActive()
    const interval = setInterval(loadActive, 5000)
    return () => clearInterval(interval)
  }, [])

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

    const isOnline = activeCameraCodes.some(
      (id) => normalizeCameraCode(id) === cam.code
    )

    return {
      ...cam,
      status: isOnline ? 'online' : 'offline',
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
