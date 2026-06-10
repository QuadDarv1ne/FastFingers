import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { createScopedLogger } from '../utils/logger'

const logger = createScopedLogger('useLeaderboard')

/**
 * Throws if Supabase is not configured.
 * Use inside queryFn/mutationFn to fail fast when credentials are missing.
 */
function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }
  return supabase
}

export interface DuelsData {
  id: string
  challenger_id: string
  opponent_id: string
  status: string
  duration: number
  bet_amount: number
  winner_id?: string
  challenger_score?: number
  opponent_score?: number
  challenger_wpm?: number
  opponent_wpm?: number
  challenger_accuracy?: number
  opponent_accuracy?: number
  created_at: string
  updated_at: string
  challenger: {
    id: string
    name: string
    avatar: string | null
  }
  opponent: {
    id: string
    name: string
    avatar: string | null
  }
}

interface UsersRelation {
  name: string
  avatar: string | null
  stats?: Record<string, unknown>
}

export interface LeaderboardEntry {
  id: string
  user_id: string
  name: string
  avatar: string | null
  wpm: number
  accuracy: number
  score: number
  level: number
  rank: number
  game_mode: string
  season: string | null
  created_at: string
}

export type GameMode = 'classic' | 'hardcore' | 'duel'
export type TimeFilter = 'today' | 'week' | 'month' | 'all'
export type SortBy = 'score' | 'wpm' | 'accuracy' | 'level'

export interface LeaderboardFilters {
  gameMode?: GameMode
  timeFilter?: TimeFilter
  sortBy?: SortBy
  season?: string
  limit?: number
}

const DEFAULT_LIMIT = 100

/**
 * Hook для получения данных лидерборда
 */
export function useLeaderboard(filters: LeaderboardFilters = {}) {
  const {
    gameMode = 'classic',
    timeFilter = 'all',
    sortBy = 'score',
    season,
    limit = DEFAULT_LIMIT,
  } = filters

  return useQuery({
    queryKey: ['leaderboard', { gameMode, timeFilter, sortBy, season, limit }],
    queryFn: async () => {
      const client = requireSupabase()

      // Build time filter
      const now = new Date()
      let dateFilter: string | undefined = undefined

      switch (timeFilter) {
        case 'today':
          dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
          break
        case 'week':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
          break
        case 'month':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
          break
      }

      // Build query
      let query = client
        .from('leaderboards')
        .select(`
          id,
          user_id,
          wpm,
          accuracy,
          score,
          game_mode,
          season,
          created_at,
          users!inner (
            id,
            name,
            avatar,
            stats
          )
        `)
        .eq('game_mode', gameMode)

      // Apply season filter
      if (season) {
        query = query.eq('season', season)
      }

      // Apply date filter
      if (dateFilter) {
        query = query.gte('created_at', dateFilter)
      }

      // Order by sort field (level is stored in nested users.stats, so we skip server-side ordering for it)
      if (sortBy !== 'level') {
        query = query.order(sortBy, {
          ascending: false,
        })
      }

      // Limit
      query = query.limit(limit)

      const { data, error } = await query

      if (error) throw error

      // Transform data
      const entries: LeaderboardEntry[] = (data || []).map((item) => {
        const users = getUsers(item.users)
        return {
          id: item.id,
          user_id: item.user_id,
          name: users.name,
          avatar: users.avatar,
          wpm: item.wpm,
          accuracy: item.accuracy,
          score: item.score,
          level: Number.parseInt(String(users.stats?.level)) || 1,
          rank: 0, // Will be set after sorting
          game_mode: item.game_mode,
          season: item.season,
          created_at: item.created_at,
        }
      })

      // Client-side sorting for level (since it's nested in users.stats)
      if (sortBy === 'level') {
        entries.sort((a, b) => b.level - a.level)
      }

      // Recalculate ranks properly
      return entries.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }))
    },
    staleTime: 1000 * 60, // 1 minute
    retry: 2,
  })
}

/**
 * Hook для получения ранга пользователя
 */
export function useUserRank(userId: string | undefined, gameMode: GameMode = 'classic') {
  return useQuery({
    queryKey: ['user-rank', userId, gameMode],
    queryFn: async () => {
      if (!userId) return null
      const client = requireSupabase()

      // Get user's best entry
      const { data, error } = await client
        .from('leaderboards')
        .select('score, wpm, accuracy')
        .eq('user_id', userId)
        .eq('game_mode', gameMode)
        .order('score', { ascending: false })
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      // Count players with better score
      const { count, error: countError } = await client
        .from('leaderboards')
        .select('*', { count: 'exact', head: true })
        .eq('game_mode', gameMode)
        .gt('score', data?.score || 0)

      if (countError) throw countError

      return {
        rank: (count || 0) + 1,
        score: data?.score || 0,
        wpm: data?.wpm || 0,
        accuracy: data?.accuracy || 0,
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  })
}

/**
 * Hook для сохранения записи в лидерборд
 */
export function useSaveLeaderboardEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entry: {
      userId: string
      gameMode: GameMode
      wpm: number
      cpm: number
      accuracy: number
      score: number
      season?: string
    }) => {
      const client = requireSupabase()
      const { userId, gameMode, wpm, cpm, accuracy, score, season } = entry

      const { data, error } = await client
        .from('leaderboards')
        .insert({
          user_id: userId,
          game_mode: gameMode,
          wpm,
          cpm,
          accuracy,
          score,
          season: season || getCurrentSeason(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate leaderboard queries
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      logger.info('Leaderboard entry saved')
    },
  })
}

/**
 * Hook для получения статистики лидерборда
 */
export function useLeaderboardStats(gameMode: GameMode = 'classic') {
  return useQuery({
    queryKey: ['leaderboard-stats', gameMode],
    queryFn: async () => {
      const client = requireSupabase()

      const [totalResult, wpmResult, topResult] = await Promise.all([
        client.from('leaderboards').select('*', { count: 'exact', head: true }).eq('game_mode', gameMode),
        client.from('leaderboards').select('wpm').eq('game_mode', gameMode),
        client.from('leaderboards').select('score, wpm').eq('game_mode', gameMode).order('score', { ascending: false }).limit(1),
      ])

      const { count: totalPlayers } = totalResult

      const avgWpm = wpmResult.data && wpmResult.data.length > 0
        ? Math.round(wpmResult.data.reduce((sum, e) => sum + e.wpm, 0) / wpmResult.data.length)
        : 0

      return {
        totalPlayers: totalPlayers || 0,
        avgWpm,
        topScore: topResult.data?.[0]?.score || 0,
        topWpm: topResult.data?.[0]?.wpm || 0,
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Helper to extract typed users relation from Supabase response
 * Supabase select with relations returns untyped nested objects
 */
function getUsers(raw: unknown): UsersRelation {
  if (raw === null || raw === undefined) {
    return { name: 'Unknown', avatar: null, stats: undefined }
  }
  if (typeof raw !== 'object') {
    return { name: 'Unknown', avatar: null, stats: undefined }
  }
  const obj = raw as Record<string, unknown>
  return {
    name: typeof obj.name === 'string' ? obj.name : 'Unknown',
    avatar: typeof obj.avatar === 'string' ? obj.avatar : null,
    stats: obj.stats as Record<string, unknown> | undefined,
  }
}

/**
 * Helper to get current season
 */
function getCurrentSeason(): string {
  const now = new Date()
  const year = now.getFullYear()
  const quarter = Math.floor(now.getMonth() / 3) + 1
  return `${year}-Q${quarter}`
}

/**
 * Hook для получения дуэлей пользователя
 */
export function useUserDuels(userId: string | undefined) {
  return useQuery({
    queryKey: ['duels', userId],
    queryFn: async () => {
      if (!userId) return []
      const client = requireSupabase()

      const { data, error } = await client
        .from('duels')
        .select(`
          *,
          challenger:challenger_id (
            id,
            name,
            avatar
          ),
          opponent:opponent_id (
            id,
            name,
            avatar
          )
        `)
        .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  })
}

/**
 * Hook для дуэлей
 */
export function useDuels() {
  const queryClient = useQueryClient()

  // Create duel challenge
  const createDuel = useMutation({
    mutationFn: async (duel: {
      challengerId: string
      opponentId: string
      betAmount?: number
    }) => {
      const client = requireSupabase()
      const { challengerId, opponentId, betAmount = 0 } = duel

      const { data, error } = await client
        .from('duels')
        .insert({
          challenger_id: challengerId,
          opponent_id: opponentId,
          bet_amount: betAmount,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duels'] })
    },
  })

  // Accept/complete duel
  const completeDuel = useMutation({
    mutationFn: async (data: {
      duelId: string
      winnerId: string
      challengerScore: number
      opponentScore: number
      challengerWpm: number
      opponentWpm: number
      challengerAccuracy: number
      opponentAccuracy: number
    }) => {
      const client = requireSupabase()
      const {
        duelId,
        winnerId,
        challengerScore,
        opponentScore,
        challengerWpm,
        opponentWpm,
        challengerAccuracy,
        opponentAccuracy,
      } = data

      const { error } = await client
        .from('duels')
        .update({
          winner_id: winnerId,
          status: 'completed',
          challenger_score: challengerScore,
          opponent_score: opponentScore,
          challenger_wpm: challengerWpm,
          opponent_wpm: opponentWpm,
          challenger_accuracy: challengerAccuracy,
          opponent_accuracy: opponentAccuracy,
          completed_at: new Date().toISOString(),
        })
        .eq('id', duelId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duels'] })
    },
  })

  return {
    useUserDuels,
    createDuel,
    completeDuel,
  }
}
