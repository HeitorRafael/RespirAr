import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { Report } from '../types'
import { clusterReports } from '../lib/infection'
import { INFECTION_CONFIG } from '../types'

interface Props {
  reports: Report[]
  userLat: number | null
  userLng: number | null
}

const TILE_URL  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
const SP_CENTER: L.LatLngExpression = [-23.5505, -46.6333]

function villainIcon(emoji: string, count: number): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="text-align:center;line-height:1;filter:drop-shadow(0 0 10px rgba(239,68,68,0.7))">
        <span style="font-size:1.6rem">${emoji}</span>
        <div style="font-size:0.45rem;color:#EF4444;font-family:monospace;letter-spacing:0.1em;margin-top:2px">${count} rep.</div>
      </div>`,
    className: '',
    iconSize:   [40, 46],
    iconAnchor: [20, 46],
  })
}

function userIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="font-size:1.4rem;text-align:center;filter:drop-shadow(0 0 6px rgba(110,231,183,0.9))">👃</div>`,
    className: '',
    iconSize:   [28, 28],
    iconAnchor: [14, 14],
  })
}

export default function MapaInfeccao({ reports, userLat, userLng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<L.Map | null>(null)
  const layersRef    = useRef<L.Layer[]>([])

  // Init map once
  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return

    try {
      mapRef.current = L.map(container, {
        center:      SP_CENTER,
        zoom:        13,
        zoomControl: true,
      })
      L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(mapRef.current)
    } catch {
      // StrictMode may trigger double-init; safe to ignore
      mapRef.current = null
      return
    }

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Center on user
  useEffect(() => {
    if (!mapRef.current || !userLat || !userLng) return
    mapRef.current.setView([userLat, userLng], 14, { animate: true })
  }, [userLat, userLng])

  // Redraw infection circles + villain icons
  useEffect(() => {
    if (!mapRef.current) return

    layersRef.current.forEach(l => mapRef.current!.removeLayer(l))
    layersRef.current = []

    const clusters = clusterReports(reports)

    clusters.forEach(cluster => {
      const config = INFECTION_CONFIG[cluster.level]
      const radius = Math.min(80 + cluster.count * 15, 400)

      const circle = L.circle([cluster.lat, cluster.lng], {
        radius,
        color:       'transparent',
        fillColor:   config.color,
        fillOpacity: Math.min(0.12 + cluster.count * 0.015, 0.5),
      }).addTo(mapRef.current!)

      layersRef.current.push(circle)

      if (config.villain) {
        const marker = L.marker([cluster.lat, cluster.lng], {
          icon: villainIcon(config.villain, cluster.count),
        }).addTo(mapRef.current!)
        layersRef.current.push(marker)
      }
    })

    if (userLat && userLng) {
      const me = L.marker([userLat, userLng], { icon: userIcon() }).addTo(mapRef.current)
      layersRef.current.push(me)
    }
  }, [reports, userLat, userLng])

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div ref={containerRef} style={{ width: '100%', height: '360px' }} />
      <div style={{
        position: 'absolute', bottom: '0.6rem', left: '0.6rem',
        fontFamily: 'monospace', fontSize: '0.5rem', color: '#aaa',
        background: 'rgba(0,0,0,0.8)', padding: '0.2rem 0.5rem',
        borderRadius: '4px', letterSpacing: '0.08em',
        zIndex: 1000, pointerEvents: 'none',
      }}>
        {reports.length} reporte{reports.length !== 1 ? 's' : ''} ativos • últimas 4h
      </div>
    </div>
  )
}
