import type { InfectionLevel } from '../types'
import { INFECTION_CONFIG } from '../types'

interface Props {
  level: InfectionLevel
  count: number
  weatherVillain?: string | null
}

const VILLAIN_LINES: Record<InfectionLevel, string[]> = {
  veludo:    ['Respira fundo. Esse momento é raro.', 'Aproveita enquanto dura, companheiro.'],
  boca:      ['Começa a ficar suspeito por aí.', 'Mantém um lenço no bolso, só por precaução.'],
  critico:   ['Área comprometida. Soro fisiológico liberado.', 'O General Poeira está operando na região.'],
  infectado: ['EPICENTRO DE RINITE. FUJA OU USE SORO.', 'Você acabou de entrar no Deserto da Rinite.'],
}

function randomLine(lines: string[]): string {
  return lines[Math.floor(Date.now() / 60_000) % lines.length]
}

export default function StatusBadge({ level, count, weatherVillain }: Props) {
  const config = INFECTION_CONFIG[level]
  const line   = randomLine(VILLAIN_LINES[level])

  return (
    <div style={{
      width: '100%',
      padding: '1.25rem 1.5rem',
      background: `${config.color}0D`,
      border: `1px solid ${config.color}25`,
      borderLeft: `4px solid ${config.color}`,
      borderRadius: '0 12px 12px 0',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
    }}>
      <span style={{ fontSize: '1.8rem', lineHeight: 1, flexShrink: 0, marginTop: '0.1rem' }}>{config.emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
          <p style={{
            fontFamily: 'monospace',
            fontSize: '0.7rem',
            color: config.color,
            margin: 0,
            fontWeight: 700,
            letterSpacing: '0.12em',
          }}>
            {config.label.toUpperCase()}
          </p>
          <span style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: '#2a2a2a', letterSpacing: '0.08em' }}>
            {config.range}
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#666', margin: 0, lineHeight: 1.5 }}>{line}</p>
        {weatherVillain && (
          <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#F97316', margin: '0.4rem 0 0', letterSpacing: '0.08em' }}>
            ⚠ {weatherVillain} detectado na sua área
          </p>
        )}
        {count > 0 && (
          <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#3a3a3a', margin: '0.2rem 0 0', letterSpacing: '0.06em' }}>
            {count} reporte{count !== 1 ? 's' : ''} ativos num raio de 500m
          </p>
        )}
      </div>
    </div>
  )
}
