import { useState, useEffect } from 'react'
import type { NarizSide } from './types'
import { getInfectionLevel, countNearby, clusterReports } from './lib/infection'
import { submitReport, isConfigured as supabaseConfigured } from './lib/supabase'
import { fetchWeatherContext } from './lib/openweather'
import type { WeatherContext } from './lib/openweather'
import { useGeolocation } from './hooks/useGeolocation'
import { useReports } from './hooks/useReports'
import NarizSeletor from './components/NarizSeletor'
import MapaInfeccao from './components/MapaInfeccao'
import StatusBadge from './components/StatusBadge'
import PlacardaVergonha from './components/PlacardaVergonha'

export default function App() {
  const [selected,   setSelected  ] = useState<NarizSide | null>(null)
  const [submitting, setSubmitting ] = useState(false)
  const [submitted,  setSubmitted  ] = useState(false)
  const [submitError,setSubmitError] = useState<string | null>(null)
  const [weather,    setWeather    ] = useState<WeatherContext | null>(null)

  const geo     = useGeolocation()
  const { reports } = useReports()

  // Auto-request location on mount
  useEffect(() => { geo.request() }, [geo.request])

  // Fetch weather context when location is known
  useEffect(() => {
    if (!geo.lat || !geo.lng) return
    fetchWeatherContext(geo.lat, geo.lng).then(setWeather).catch(() => null)
  }, [geo.lat, geo.lng])

  const nearbyCount = geo.lat && geo.lng ? countNearby(reports, geo.lat, geo.lng) : 0
  const userLevel   = getInfectionLevel(nearbyCount)
  const clusters    = clusterReports(reports)

  const handleReport = async () => {
    if (!selected) return
    setSubmitting(true)
    setSubmitError(null)

    if (!geo.lat || !geo.lng) {
      geo.request()
      setSubmitting(false)
      setSubmitError('Aguardando sua localização... Permita o acesso e tente novamente.')
      return
    }

    try {
      await submitReport(geo.lat, geo.lng, selected)
      setSubmitted(true)
      setSelected(null)
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao enviar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const btnReady = !!selected && !submitting && !submitted

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2.5rem 1.25rem 4rem',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Header */}
      <header style={{ width: '100%', maxWidth: '520px', marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: 'clamp(2.2rem, 8vw, 3rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          margin: 0,
        }}>
          Respir<span style={{ color: '#6EE7B7' }}>Ar</span>
        </h1>
        <p style={{ color: '#2a2a2a', fontSize: '0.6rem', marginTop: '0.35rem', letterSpacing: '0.18em', fontFamily: 'monospace' }}>
          O WAZE DO NARIZ ENTUPIDO
        </p>
      </header>

      <main style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

        {/* Dev mode banner */}
        {!supabaseConfigured && (
          <div style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: '#F97316', textAlign: 'center', letterSpacing: '0.1em', padding: '0.5rem', background: 'rgba(249,115,22,0.08)', borderRadius: '6px', border: '1px solid rgba(249,115,22,0.2)' }}>
            ⚠ MODO DEMO — configure .env com VITE_SUPABASE_URL para ativar o mapa colaborativo
          </div>
        )}

        {/* Geolocation loading feedback */}
        {geo.loading && (
          <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#555', textAlign: 'center', letterSpacing: '0.1em', margin: 0 }}>
            📍 localizando você...
          </p>
        )}
        {geo.error && (
          <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#F97316', textAlign: 'center', letterSpacing: '0.08em', margin: 0 }}>
            ⚠ {geo.error}
          </p>
        )}

        {/* User status */}
        <StatusBadge level={userLevel} count={nearbyCount} weatherVillain={weather?.villain} />

        {/* Weather info */}
        {weather && (
          <div style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: '#333', letterSpacing: '0.1em', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <span>💧 {weather.humidity}% umidade</span>
            <span>🌫 AQI {weather.aqi}/5</span>
            <span style={{ textTransform: 'capitalize' }}>{weather.description}</span>
          </div>
        )}

        {/* Nariz Seletor */}
        <NarizSeletor selected={selected} onChange={setSelected} />

        {/* Report button */}
        <div>
          <button
            onClick={handleReport}
            disabled={!selected || submitting || submitted}
            style={{
              width: '100%',
              background: btnReady ? '#6EE7B7' : '#0f0f0f',
              color:      btnReady ? '#0a0a0a' : '#2a2a2a',
              border:     `1px solid ${btnReady ? '#6EE7B7' : '#1a1a1a'}`,
              borderRadius: '14px',
              padding: '1.15rem',
              fontSize: '0.88rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              transition: 'all 0.2s ease',
              cursor: btnReady ? 'pointer' : 'not-allowed',
            }}
          >
            {submitted   ? '✅ REPORTADO! OBRIGADO, HERÓI DA NAÇÃO.' :
             submitting  ? '⏳ ENVIANDO...' :
             geo.loading ? '📍 AGUARDANDO LOCALIZAÇÃO...' :
             !geo.lat    ? '📍 REPORTAR (clique para permitir GPS)' :
             !selected   ? '👆 SELECIONE A NARINA ACIMA' :
                           '🚨 REPORTAR ENTUPIMENTO'}
          </button>
          {submitError && (
            <p style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: '#F97316', marginTop: '0.5rem', textAlign: 'center', letterSpacing: '0.06em' }}>
              {submitError}
            </p>
          )}
        </div>

        {/* Map */}
        <MapaInfeccao reports={reports} userLat={geo.lat} userLng={geo.lng} />

        {/* Ranking */}
        <PlacardaVergonha clusters={clusters} />

      </main>

      <footer style={{ marginTop: '3rem', fontFamily: 'monospace', fontSize: '0.48rem', color: '#181818', letterSpacing: '0.18em' }}>
        [ v0.1.0 — RESPIRAR EM CONSTRUÇÃO ]
      </footer>
    </div>
  )
}
