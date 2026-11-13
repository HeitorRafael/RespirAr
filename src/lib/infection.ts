import type { Report, ClusterPoint, InfectionLevel } from '../types'

const CLUSTER_RADIUS_DEG = 0.005 // ~550m at equator

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function countNearby(reports: Report[], lat: number, lng: number, radiusKm = 0.5): number {
  return reports.filter(r => haversineKm(r.lat, r.lng, lat, lng) <= radiusKm).length
}

export function getInfectionLevel(count: number): InfectionLevel {
  if (count >= 20) return 'infectado'
  if (count >= 5)  return 'critico'
  if (count >= 1)  return 'boca'
  return 'veludo'
}

export function clusterReports(reports: Report[]): ClusterPoint[] {
  const clusters: ClusterPoint[] = []
  const used = new Set<number>()

  for (let i = 0; i < reports.length; i++) {
    if (used.has(i)) continue
    let sumLat = reports[i].lat
    let sumLng = reports[i].lng
    let count  = 1
    used.add(i)

    for (let j = i + 1; j < reports.length; j++) {
      if (used.has(j)) continue
      const avgLat = sumLat / count
      const avgLng = sumLng / count
      const dLat = Math.abs(reports[j].lat - avgLat)
      const dLng = Math.abs(reports[j].lng - avgLng)
      if (dLat < CLUSTER_RADIUS_DEG && dLng < CLUSTER_RADIUS_DEG) {
        sumLat += reports[j].lat
        sumLng += reports[j].lng
        count++
        used.add(j)
      }
    }

    clusters.push({
      lat:   sumLat / count,
      lng:   sumLng / count,
      count,
      level: getInfectionLevel(count),
    })
  }

  return clusters.sort((a, b) => b.count - a.count)
}
