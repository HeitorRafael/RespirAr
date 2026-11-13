import { useState, useEffect } from 'react'
import type { Report } from '../types'
import { fetchActiveReports, subscribeToReports, supabase } from '../lib/supabase'

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000

export function useReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError  ] = useState<string | null>(null)

  useEffect(() => {
    let alive = true

    fetchActiveReports()
      .then(data  => { if (alive) { setReports(data); setLoading(false) } })
      .catch(err  => { if (alive) { setError((err as Error).message); setLoading(false) } })

    const channel = subscribeToReports(report => {
      if (alive) setReports(prev => [report, ...prev])
    })

    // Prune expired reports every minute
    const pruneInterval = setInterval(() => {
      const cutoff = new Date(Date.now() - FOUR_HOURS_MS).toISOString()
      if (alive) setReports(prev => prev.filter(r => r.created_at > cutoff))
    }, 60_000)

    return () => {
      alive = false
      void supabase.removeChannel(channel)
      clearInterval(pruneInterval)
    }
  }, [])

  return { reports, loading, error }
}
