import { useCallback, useEffect, useRef, useState } from 'react'
import { mockDetections } from '@/data/mockDetections'
import { randomPlate } from '@/lib/utils'

const reasons = {
  normal: ['Passage enregistré', 'Circulation normale'],
  orange: ['Plaque signalée — suspecte', 'Véhicule recherché'],
  red: ['Vol signalé', 'Plaque frauduleuse'],
}

const locations = { A: 'Delmas 32', B: 'Pétion-Ville', C: 'Tabarre' }

function pickLevel() {
  const r = Math.random()
  if (r < 0.8) return 'normal'
  if (r < 0.95) return 'orange'
  return 'red'
}

function createDetection() {
  const level = pickLevel()
  const camera = ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
  const plate = randomPlate()
  return {
    id: `live-${Date.now()}`,
    plate,
    camera,
    cameraLocation: locations[camera],
    timestamp: new Date(),
    level,
    reason: reasons[level][Math.floor(Math.random() * reasons[level].length)],
    confidence: 0.85 + Math.random() * 0.14,
    imageUrl: `https://picsum.photos/seed/${plate}/400/220`,
  }
}

export function useLiveFeed(onRedAlert) {
  const [detections, setDetections] = useState(() => mockDetections.slice(0, 10))
  const [newIds, setNewIds] = useState(new Set())
  const counter = useRef(10)

  const addDetection = useCallback(() => {
    const det = createDetection()
    counter.current += 1
    det.id = `det-live-${counter.current}`

    setDetections((prev) => [det, ...prev.slice(0, 9)])
    setNewIds((prev) => new Set(prev).add(det.id))
    setTimeout(() => {
      setNewIds((prev) => {
        const next = new Set(prev)
        next.delete(det.id)
        return next
      })
    }, 2000)

    if (det.level === 'red') onRedAlert?.(det)
  }, [onRedAlert])

  useEffect(() => {
    const id = setInterval(addDetection, 8000)
    return () => clearInterval(id)
  }, [addDetection])

  return { detections, newIds }
}
