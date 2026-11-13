export type NarizSide      = 'esquerda' | 'direita' | 'ambas'
export type InfectionLevel = 'veludo' | 'boca' | 'critico' | 'infectado'

export interface Report {
  id: string
  lat: number
  lng: number
  side: NarizSide
  created_at: string
}

export interface ClusterPoint {
  lat: number
  lng: number
  count: number
  level: InfectionLevel
}

export const INFECTION_CONFIG: Record<InfectionLevel, {
  label: string
  color: string
  emoji: string
  range: string
  villain?: string
}> = {
  veludo:    { label: 'Nariz de Veludo',    color: '#6EE7B7', emoji: '💚', range: '0 reportes' },
  boca:      { label: 'Respirador de Boca', color: '#FBBF24', emoji: '🟡', range: '1–5 reportes' },
  critico:   { label: 'Zona Crítica',       color: '#F97316', emoji: '🟠', range: '5–20 reportes', villain: '🦠' },
  infectado: { label: 'INFECTADO',          color: '#EF4444', emoji: '🔴', range: '20+ reportes',  villain: '☣️' },
}
