import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function generateGroupCode(name: string): string {
  const clean = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${clean}${rand}`
}

export const APODOS = [
  'El Ciego',
  'El Adivinador de Humo',
  'El Peor del Grupo',
  'El Experto en Fallar',
  'El Profeta al Revés',
  'El GPS Sin Señal',
  'El Oráculo Roto',
]

export function getApodo(position: number, total: number): string | null {
  if (position !== total) return null
  return APODOS[Math.floor(Math.random() * APODOS.length)]
}

export function formatDeadline(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now()
  const hours = Math.floor(diff / 1000 / 60 / 60)
  const minutes = Math.floor((diff / 1000 / 60) % 60)
  if (hours > 24) return `${Math.floor(hours / 24)} días`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes} minutos`
}
