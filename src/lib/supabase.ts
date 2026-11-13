import { createClient } from '@supabase/supabase-js'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { NarizSide, Report } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isConfigured = !!(supabaseUrl && supabaseKey)

// Fallback URL prevents "Invalid URL" crash when .env is not configured
const supabase = createClient(
  supabaseUrl || 'https://not-configured.supabase.co',
  supabaseKey || 'not-configured',
)

export async function submitReport(lat: number, lng: number, side: NarizSide): Promise<void> {
  if (!isConfigured) throw new Error('Supabase não configurado. Preencha o .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
  const { error } = await supabase.from('reports').insert({ lat, lng, side })
  if (error) throw new Error(error.message)
}

export async function fetchActiveReports(): Promise<Report[]> {
  if (!isConfigured) return []
  const since = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('reports')
    .select('id, lat, lng, side, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Report[]
}

export function subscribeToReports(callback: (report: Report) => void): RealtimeChannel {
  if (!isConfigured) {
    // Return a dummy channel that subscribes to nothing
    return supabase.channel('dummy-not-configured')
  }
  return supabase
    .channel('reports-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, payload => {
      callback(payload.new as Report)
    })
    .subscribe()
}

export { supabase }
