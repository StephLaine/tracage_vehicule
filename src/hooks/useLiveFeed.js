import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchDetections } from '@/lib/api'

export function useLiveFeed(onRedAlert) {
  const [detections, setDetections] = useState([])
  const [allDetections, setAllDetections] = useState([])
  const [newIds, setNewIds] = useState(new Set())
  const lastChecked = useRef(null)
  const knownIds = useRef(new Set())

  const loadDetections = useCallback(async () => {
    const realDets = await fetchDetections()
    setAllDetections(realDets)
    
    // Live feed table shows the 10 most recent detections
    const sliced = realDets.slice(0, 10)
    setDetections(sliced)

    // Check for newly added items to trigger animations and alerts
    if (lastChecked.current !== null) {
      const newlyAdded = []
      realDets.forEach((det) => {
        if (!knownIds.current.has(det.id)) {
          knownIds.current.add(det.id)
          newlyAdded.push(det)
        }
      })

      if (newlyAdded.length > 0) {
        const addedIds = newlyAdded.map((d) => d.id)
        setNewIds((prev) => {
          const next = new Set(prev)
          addedIds.forEach((id) => next.add(id))
          return next
        })

        setTimeout(() => {
          setNewIds((prev) => {
            const next = new Set(prev)
            addedIds.forEach((id) => next.delete(id))
            return next
          })
        }, 3000)

        // Check for any red alerts in the newly received detections
        const redAlerts = newlyAdded.filter((d) => d.level === 'red')
        if (redAlerts.length > 0 && onRedAlert) {
          onRedAlert(redAlerts[0])
        }
      }
    } else {
      // First load: initialize known IDs
      realDets.forEach((det) => knownIds.current.add(det.id))
      lastChecked.current = Date.now()
    }
  }, [onRedAlert])

  useEffect(() => {
    loadDetections()
    const id = setInterval(loadDetections, 3000)
    return () => clearInterval(id)
  }, [loadDetections])

  return { detections, allDetections, newIds, refresh: loadDetections }
}
