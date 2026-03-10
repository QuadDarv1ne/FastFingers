import { createClient } from '@supabase/supabase-js'
import { createScopedLogger } from '../utils/logger'

const logger = createScopedLogger('supabase')

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

if (!supabaseUrl || !supabaseAnonKey) {
  logger.warn('Supabase credentials not configured. Some features may be unavailable.')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: { 'X-Client-Info': 'fastfingers' },
      },
    })
  : null

export type { User as SupabaseUser, Session } from '@supabase/supabase-js'

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }))
        throw new Error(error.message || `HTTP ${response.status}`)
      }

      return response
    } catch (error) {
      lastError = error as Error

      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error('Unknown error')
}
