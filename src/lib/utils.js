import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatTime(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function randomPlate() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const pick = (n) =>
    Array.from({ length: n }, () => letters[Math.floor(Math.random() * letters.length)]).join('')
  const num = String(Math.floor(1000 + Math.random() * 9000))
  return `HT-${num}-${pick(2)}`
}
