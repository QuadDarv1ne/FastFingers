/**
 * useSupabase — Hook для работы с Supabase клиентом
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useMemo } from 'react'
import { supabase } from '../services/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

interface UseSupabaseResult {
  client: SupabaseClient | null
  isReady: boolean
}

/**
 * Hook возвращающий { client, isReady } для безопасной работы с Supabase.
 *
 * Usage:
 *   const { client, isReady } = useSupabase()
 *   if (!isReady) return <OfflineFallback />
 *   const { data } = await client.from('users').select()
 */
export function useSupabase(): UseSupabaseResult {
  return useMemo(
    () => ({
      client: supabase,
      isReady: !!supabase,
    }),
    []
  )
}
