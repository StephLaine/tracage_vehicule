export const API_BASE_URL = 'https://tracage-vehicule.onrender.com'

const cameraLocations = {
  A: 'Delmas 32 — Avenue Christophe',
  B: 'Pétion-Ville — Rue Panaméricaine',
  C: 'Tabarre — Route de l\'Aéroport',
}

const defaultReasons = {
  normal: 'Passage enregistré',
  orange: 'Plaque signalée — suspecte',
  red: 'Vol signalé',
}

export function normalizeCameraCode(cameraId) {
  if (!cameraId) return 'A'
  const clean = cameraId.toString().toLowerCase()
  if (clean.includes('cam-a') || clean === 'a' || clean.endsWith('01')) return 'A'
  if (clean.includes('cam-b') || clean === 'b' || clean.endsWith('02')) return 'B'
  if (clean.includes('cam-c') || clean === 'c' || clean.endsWith('03')) return 'C'
  return cameraId.toUpperCase()
}

export function normalizeDetection(det, index) {
  const level = det.status || 'normal'
  const camera = normalizeCameraCode(det.camera_id)
  const plate = det.license_number || 'HT-0000-XX'

  return {
    id: det.id || `det-real-${det.received_at}-${plate}-${index}`,
    plate,
    camera,
    cameraLocation: cameraLocations[camera] || `Zone ${camera}`,
    timestamp: det.received_at ? new Date(det.received_at) : new Date(),
    level,
    reason: det.reason || defaultReasons[level] || 'Contrôle routier',
    confidence: typeof det.license_number_score === 'number' ? det.license_number_score : 0.90,
    imageUrl: `https://picsum.photos/seed/${plate}/400/220`,
  }
}

export async function fetchDetections() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/detections`)
    if (!res.ok) {
      throw new Error(`Erreur API: ${res.status}`)
    }
    const data = await res.json()
    if (data && Array.isArray(data.detections)) {
      return data.detections
        .map((d, index) => normalizeDetection(d, index))
        .sort((a, b) => b.timestamp - a.timestamp)
    }
    return []
  } catch (error) {
    console.error('Erreur lors de la récupération des détections:', error)
    return []
  }
}

export async function seedDetections(detections) {
  try {
    // Format to backend representation
    const payload = {
      detections: detections.map((d) => ({
        camera_id: d.camera || 'A',
        license_number: d.plate,
        license_number_score: d.confidence || 0.92,
        status: d.level || 'normal',
      })),
    }

    const res = await fetch(`${API_BASE_URL}/api/detections/batch/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      throw new Error(`Erreur API batch: ${res.status}`)
    }
    return await res.json()
  } catch (error) {
    console.error('Erreur lors du seeding des détections:', error)
    throw error;
  }
}

export async function fetchCameras() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cameras`)
    if (!res.ok) {
      throw new Error(`Erreur API: ${res.status}`)
    }
    const data = await res.json()
    if (data && Array.isArray(data.cameras)) {
      return data.cameras
    }
    return []
  } catch (error) {
    console.error('Erreur lors de la récupération des caméras:', error)
    return []
  }
}
