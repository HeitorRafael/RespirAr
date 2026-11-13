import { useState, useEffect } from 'react'
import type { ClusterPoint } from '../types'
import { INFECTION_CONFIG } from '../types'
import { reverseGeocode } from '../lib/openweather'

interface Props {
  clusters: ClusterPoint[]
}

export default function PlacardaVergonha({ clusters }: Props) {
  const top5 = clusters.slice(0, 5)
  const [labels, setLabels] = useState<Record<string, string>>({})

  useEffect(() => {
    top5.forEach(cluster => {
      const key = `${cluster.lat.toFixed(4)},${cluster.lng.toFixed(4)}`
      if (labels[key]) return
      reverseGeocode(cluster.lat, cluster.lng)
        .then(name => setLabels(prev => ({ ...prev, [key]: name })))
        .catch(() => {})
    })
  }, [top5.map(c => `${c.lat.toFixed(4)},${c.lng.toFixed(4)}`).join()])

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#444', letterSpacing: '0.15em', margin: 0 }}>
          🏆 PLACAR DA VERGONHA
        </p>
        <span style={{ fontFamily: 'monospace', fontSize: '0.5rem', color: '#2a2a2a', letterSpacing: '0.1em' }}>
          ÚLTIMAS 4H
        </span>
      </div>

      {top5.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#222',
          fontFamily: 'monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.1em',
          lineHeight: 2,
        }}>
          NENHUM REPORTE AINDA.<br />
          SEJA O PRIMEIRO HERÓI DO NARIZ.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {top5.map((cluster, i) => {
            const config = INFECTION_CONFIG[cluster.level]
            const key    = `${cluster.lat.toFixed(4)},${cluster.lng.toFixed(4)}`
            const label  = labels[key] ?? `${cluster.lat.toFixed(3)}, ${cluster.lng.toFixed(3)}`

            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  border: `1px solid ${config.color}12`,
                }}
              >
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '0.7rem',
                  color: i === 0 ? config.color : '#2a2a2a',
                  fontWeight: i === 0 ? 700 : 400,
                  minWidth: '1.2rem',
                }}>
                  {i + 1}.
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#ccc', margin: '0 0 0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {label}
                  </p>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: config.color, margin: 0, letterSpacing: '0.06em' }}>
                    {config.label} · {cluster.count} rep.
                  </p>
                </div>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{config.emoji}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
