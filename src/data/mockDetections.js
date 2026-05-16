const locations = {
  A: 'Delmas 32',
  B: 'Pétion-Ville',
  C: 'Tabarre',
}

const reasons = {
  normal: ['Passage enregistré', 'Circulation normale', 'Contrôle routier'],
  orange: ['Plaque signalée — suspecte', 'Véhicule recherché', 'Assurance expirée'],
  red: ['Vol signalé', 'Plaque frauduleuse', 'Mandat actif'],
}

const plates = [
  'HT-2245-XY', 'AA-1234-BB', 'HT-4821-KM', 'HT-1190-RX', 'AA-7734-PL',
  'HT-3301-NQ', 'BB-9021-LT', 'HT-5512-DF', 'AA-4400-HK', 'HT-8819-MZ',
  'HT-1024-JP', 'AA-6655-WE', 'HT-7743-AS', 'BB-2109-VC', 'HT-9981-RT',
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function ago(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000)
}

export const mockDetections = Array.from({ length: 50 }, (_, i) => {
  const levelRoll = Math.random()
  const level = levelRoll < 0.65 ? 'normal' : levelRoll < 0.88 ? 'orange' : 'red'
  const camera = pick(['A', 'B', 'C'])
  const plate = pick(plates)

  return {
    id: `det-${String(i + 1).padStart(3, '0')}`,
    plate,
    camera,
    cameraLocation: locations[camera],
    timestamp: ago(i * 7 + Math.floor(Math.random() * 5)),
    level,
    reason: pick(reasons[level]),
    confidence: 0.82 + Math.random() * 0.17,
    imageUrl: `https://picsum.photos/seed/${plate}/400/220`,
  }
}).sort((a, b) => b.timestamp - a.timestamp)

export const demoPlates = [
  { plate: 'HT-2245-XY', status: 'Volée', passages: 12 },
  { plate: 'AA-1234-BB', status: 'Frauduleuse', passages: 8 },
  { plate: 'HT-4821-KM', status: 'Normale', passages: 24 },
]

export const trajectoryByPlate = {
  'HT-2245-XY': [
    { camera: 'A', location: 'Delmas 32', timestamp: ago(180) },
    { camera: 'B', location: 'Pétion-Ville', timestamp: ago(95) },
    { camera: 'C', location: 'Tabarre', timestamp: ago(42) },
  ],
  'AA-1234-BB': [
    { camera: 'C', location: 'Tabarre', timestamp: ago(240) },
    { camera: 'A', location: 'Delmas 32', timestamp: ago(120) },
  ],
  'HT-4821-KM': [
    { camera: 'B', location: 'Pétion-Ville', timestamp: ago(60) },
    { camera: 'A', location: 'Delmas 32', timestamp: ago(30) },
    { camera: 'B', location: 'Pétion-Ville', timestamp: ago(10) },
  ],
}
