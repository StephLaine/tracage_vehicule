import { mockDetections } from './mockDetections'

const statuses = ['new', 'validated', 'false_positive']
const operators = ['Agent Dubois', 'Agent Laurent', 'Agent Michel', 'Agent Pierre']

export const mockAlerts = mockDetections
  .filter((d) => d.level !== 'normal')
  .slice(0, 30)
  .map((det, i) => ({
    id: `alert-${String(i + 1).padStart(3, '0')}`,
    detectionId: det.id,
    plate: det.plate,
    level: det.level,
    reason: det.reason,
    camera: det.camera,
    cameraLocation: det.cameraLocation,
    timestamp: det.timestamp,
    confidence: det.confidence,
    imageUrl: det.imageUrl,
    status: statuses[i % 3],
    validatedBy: i % 3 !== 0 ? operators[i % operators.length] : null,
    validatedAt: i % 3 !== 0 ? new Date(det.timestamp.getTime() + 3600000) : null,
  }))
