import { useEffect, useState } from 'react'
import { mockCameras } from '@/data/mockCameras'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { MapPin } from 'lucide-react'
import { useLiveFeed } from '@/hooks/useLiveFeed'
import { fetchCameras, normalizeCameraCode } from '@/lib/api'

export function CamerasPage() {
  const [activeCameraCodes, setActiveCameraCodes] = useState([])
  const [streamErrors, setStreamErrors] = useState({})
  const { allDetections } = useLiveFeed()

  useEffect(() => {
    const loadActive = async () => {
      const active = await fetchCameras()
      setActiveCameraCodes(active)
      // Automatically clear stream errors for cameras that are now online
      setStreamErrors((prev) => {
        const next = { ...prev }
        active.forEach((id) => {
          const code = normalizeCameraCode(id)
          next[code] = false
        })
        return next
      })
    }
    loadActive()
    const interval = setInterval(loadActive, 5000)
    return () => clearInterval(interval)
  }, [])

  const cameras = mockCameras.map((cam) => {
    const camDets = allDetections.filter((d) => d.camera === cam.code)
    const lastDet = camDets[0]
    const todayCamDets = camDets.filter(
      (d) => d.timestamp.toDateString() === new Date().toDateString()
    )

    const rawActiveId = activeCameraCodes.find(
      (id) => normalizeCameraCode(id) === cam.code
    )
    const online = !!rawActiveId

    return {
      ...cam,
      status: online ? 'online' : 'offline',
      activeId: rawActiveId || cam.code,
      lastDetection: lastDet ? { plate: lastDet.plate, at: lastDet.timestamp } : cam.lastDetection,
      todayCount: todayCamDets.length,
    }
  })

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {cameras.map((cam) => {
          const online = cam.status === 'online'
          const showLiveStream = online && !streamErrors[cam.code]

          return (
            <article
              key={cam.id}
              className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <div className="flex aspect-video items-center justify-center bg-black overflow-hidden relative">
                {showLiveStream ? (
                  <img
                    src={`/video_feed/${cam.activeId}`}
                    alt={cam.name}
                    className="h-full w-full object-cover"
                    onError={() => setStreamErrors((prev) => ({ ...prev, [cam.code]: true }))}
                  />
                ) : (
                  <div className="text-center text-sm text-[var(--color-muted)] p-4">
                    {online ? (
                      <div className="space-y-3">
                        <p>Flux {cam.name} — Erreur de connexion</p>
                        <button
                          type="button"
                          onClick={() => setStreamErrors((prev) => ({ ...prev, [cam.code]: false }))}
                          className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-all cursor-pointer"
                        >
                          Réessayer
                        </button>
                      </div>
                    ) : (
                      `Flux ${cam.name} — Hors ligne`
                    )}
                  </div>
                )
              }
                {showLiveStream && (
                  <div className="absolute top-3 right-3 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white animate-pulse">
                    Live
                  </div>
                )}
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">{cam.name}</h3>
                  <span className="flex items-center gap-1.5 text-xs">
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        online ? 'bg-emerald-400' : 'bg-red-400',
                      )}
                    />
                    {online ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
                <p className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {cam.location}
                </p>
                <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4 text-sm">
                  <div>
                    <p className="font-semibold text-white">{cam.todayCount}</p>
                    <p className="text-[var(--color-muted)]">Détections aujourd'hui</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{cam.readabilityRate} %</p>
                    <p className="text-[var(--color-muted)]">Taux de lisibilité</p>
                  </div>
                </div>
                <div className="text-xs text-[var(--color-muted)]">
                  <p>
                    Dernière détection :{' '}
                    <span className="font-mono text-white">{cam.lastDetection?.plate || 'Aucune'}</span>
                  </p>
                  <p className="mt-1">
                    {cam.lastDetection?.at ? formatDateTime(new Date(cam.lastDetection.at)) : ''}
                  </p>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="mb-4 font-semibold text-white">Carte — Port-au-Prince</h2>
        <div className="relative flex aspect-[2/1] items-center justify-center rounded-lg bg-[#0d1810]">
          <svg viewBox="0 0 400 200" className="h-full w-full max-w-2xl opacity-80">
            <path
              d="M40 120 Q120 40 200 80 T360 100 L340 160 L60 150 Z"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
            />
          </svg>
          {cameras.map((cam, i) => (
            <div
              key={cam.id}
              className="absolute flex flex-col items-center"
              style={{
                left: `${20 + i * 30}%`,
                top: `${35 + (i % 2) * 20}%`,
              }}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white',
                  cam.status === 'online' ? 'bg-emerald-600' : 'bg-red-600',
                )}
              >
                {cam.code}
              </span>
              <span className="mt-1 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                {cam.location.split('—')[0].trim()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
