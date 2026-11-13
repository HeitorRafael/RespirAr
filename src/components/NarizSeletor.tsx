import { useState } from 'react'
import type { NarizSide } from '../types'

interface Props {
  selected: NarizSide | null
  onChange: (side: NarizSide | null) => void
}

const SKIN      = '#c07050'
const SKIN_LITE = '#d08868'
const HOLE      = 'rgba(12, 6, 6, 0.92)'
const ACTIVE    = '#6EE7B7'
const HOVER_FIL = 'rgba(110,231,183,0.18)'

export default function NarizSeletor({ selected, onChange }: Props) {
  const [hovered, setHovered] = useState<'esquerda' | 'direita' | null>(null)

  const leftActive  = selected === 'esquerda' || selected === 'ambas'
  const rightActive = selected === 'direita'  || selected === 'ambas'

  const handleNostril = (side: 'esquerda' | 'direita') => {
    if (selected === side)    return onChange(null)
    if (selected === 'ambas') return onChange(side === 'esquerda' ? 'direita' : 'esquerda')
    if (selected !== null)    return onChange('ambas')
    onChange(side)
  }

  const lFill = leftActive  ? ACTIVE : hovered === 'esquerda' ? HOVER_FIL : SKIN
  const rFill = rightActive ? ACTIVE : hovered === 'direita'  ? HOVER_FIL : SKIN

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
      <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#444', letterSpacing: '0.15em', margin: 0 }}>
        TOQUE NA NARINA AFETADA
      </p>

      {/* SVG Nose */}
      <svg
        viewBox="0 0 220 200"
        style={{ width: '200px', height: '182px', overflow: 'visible' }}
        aria-label="Nariz — clique na narina afetada"
        role="img"
      >
        {/* Nose bridges */}
        <path
          d="M 110 18 C 97 45, 78 78, 62 115 C 50 138, 32 150, 28 162"
          fill="none" stroke={SKIN_LITE} strokeWidth="5" strokeLinecap="round"
        />
        <path
          d="M 110 18 C 123 45, 142 78, 158 115 C 170 138, 188 150, 192 162"
          fill="none" stroke={SKIN_LITE} strokeWidth="5" strokeLinecap="round"
        />
        {/* Nose bottom arc */}
        <path
          d="M 28 162 Q 110 192 192 162"
          fill="none" stroke={SKIN_LITE} strokeWidth="5" strokeLinecap="round"
        />
        {/* Nose tip highlight */}
        <ellipse cx="110" cy="112" rx="14" ry="10" fill={SKIN_LITE} opacity="0.6" />

        {/* LEFT nostril */}
        <g
          onClick={() => handleNostril('esquerda')}
          onMouseEnter={() => setHovered('esquerda')}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: 'pointer' }}
          role="button"
          aria-label="Narina esquerda"
          aria-pressed={leftActive}
        >
          {(leftActive || hovered === 'esquerda') && (
            <ellipse cx="62" cy="163" rx="54" ry="36" fill={ACTIVE} opacity="0.12" />
          )}
          <ellipse cx="62" cy="163" rx="44" ry="30" fill={lFill} style={{ transition: 'fill 0.18s ease' }} />
          <ellipse cx="62" cy="167" rx="26" ry="18" fill={HOLE} />
          {leftActive && (
            <text x="62" y="172" textAnchor="middle" fontSize="14" fill="#0a0a0a">✓</text>
          )}
        </g>

        {/* RIGHT nostril */}
        <g
          onClick={() => handleNostril('direita')}
          onMouseEnter={() => setHovered('direita')}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: 'pointer' }}
          role="button"
          aria-label="Narina direita"
          aria-pressed={rightActive}
        >
          {(rightActive || hovered === 'direita') && (
            <ellipse cx="158" cy="163" rx="54" ry="36" fill={ACTIVE} opacity="0.12" />
          )}
          <ellipse cx="158" cy="163" rx="44" ry="30" fill={rFill} style={{ transition: 'fill 0.18s ease' }} />
          <ellipse cx="158" cy="167" rx="26" ry="18" fill={HOLE} />
          {rightActive && (
            <text x="158" y="172" textAnchor="middle" fontSize="14" fill="#0a0a0a">✓</text>
          )}
        </g>

        {/* Labels inside nostrils when not selected */}
        {!leftActive && (
          <text x="62" y="169" textAnchor="middle" fontSize="10" fill="#666"
            style={{ pointerEvents: 'none', userSelect: 'none' }}>E</text>
        )}
        {!rightActive && (
          <text x="158" y="169" textAnchor="middle" fontSize="10" fill="#666"
            style={{ pointerEvents: 'none', userSelect: 'none' }}>D</text>
        )}
      </svg>

      {/* Ambas button */}
      <button
        onClick={() => selected === 'ambas' ? onChange(null) : onChange('ambas')}
        style={{
          background: selected === 'ambas' ? '#6EE7B7' : 'transparent',
          color:      selected === 'ambas' ? '#0a0a0a' : '#6EE7B7',
          border: '1px solid rgba(110,231,183,0.35)',
          borderRadius: '8px',
          padding: '0.55rem 1.5rem',
          fontSize: '0.78rem',
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.05em',
          transition: 'all 0.15s ease',
        }}
      >
        😤 AMBAS — modo catástrofe total
      </button>

      {/* Feedback text */}
      <div style={{ height: '1.2rem' }}>
        {selected && (
          <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#6EE7B7', letterSpacing: '0.1em', margin: 0, textAlign: 'center' }}>
            {selected === 'esquerda' ? '← ESQUERDA SELECIONADA' :
             selected === 'direita'  ? 'DIREITA SELECIONADA →'  :
             '← AMBAS SELECIONADAS — DEUS TENHA MISERICÓRDIA →'}
          </p>
        )}
      </div>
    </div>
  )
}
