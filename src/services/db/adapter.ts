/**
 * FastFingers Frontend Database Adapter
 * Communicates with the backend server via HTTP API
 */

import { TypingStats, UserProgress } from '../../types'
import { logger } from '../../utils/logger'

interface BackendHealthResponse {
  status: 'healthy' | 'unhealthy'
  database: {
    type: string
    connected: boolean
  }
  uptime: number
  timestamp: string
}

interface BackendDatabasesResponse {
  available: string[]
  current: string
  autoDetected: boolean
}

export class ApiDatabaseAdapter {
  private baseUrl: string
  private available = false
  private currentDb: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  async initialize(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`)
      if (!response.ok) return false
      const data: BackendHealthResponse = await response.json()
      this.available = data.status === 'healthy' && data.database.connected
      this.currentDb = data.database.type
      logger.info(`[DbAdapter] Connected to ${this.currentDb} backend`)
      return this.available
    } catch {
      this.available = false
      logger.warn('[DbAdapter] Backend server not available')
      return false
    }
  }

  async getAvailableDatabases(): Promise<BackendDatabasesResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/databases`)
      if (!response.ok) return null
      return await response.json()
    } catch {
      logger.warn('[DbAdapter] Failed to fetch available databases')
      return null
    }
  }

  isAvailable(): boolean {
    return this.available
  }

  getCurrentDatabase(): string | null {
    return this.currentDb
  }

  async saveSession(session: Omit<TypingStats, 'sessionId'> & { userId: string }): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: session.userId,
          wpm: session.wpm,
          cpm: session.cpm,
          accuracy: session.accuracy,
          errors: session.errors,
          total_chars: session.totalChars,
          duration: session.timeElapsed,
          date: new Date().toISOString(),
        }),
      })
      return response.ok
    } catch (err) {
      logger.error('[DbAdapter] Failed to save session', err)
      return false
    }
  }

  async saveUserStats(userId: string, stats: Partial<UserProgress>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/progress/stats`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          total_xp: stats.xp ?? 0,
          level: stats.level ?? 1,
          best_wpm: stats.bestWpm ?? 0,
          best_accuracy: stats.bestAccuracy ?? 0,
          total_words_typed: stats.totalWordsTyped ?? 0,
          total_practice_time: stats.totalPracticeTime ?? 0,
          current_streak: stats.streak ?? 0,
          longest_streak: stats.streak ?? 0,
          completed_challenges: [],
        }),
      })
      return response.ok
    } catch (err) {
      logger.error('[DbAdapter] Failed to save user stats', err)
      return false
    }
  }
}

/**
 * Create and initialize the database adapter
 * Tries backend first, falls back to null (localStorage/Supabase will be used)
 */
export async function createDatabaseAdapter(): Promise<ApiDatabaseAdapter | null> {
  const adapter = new ApiDatabaseAdapter(
    import.meta.env.VITE_API_URL || 'http://localhost:3001'
  )
  const success = await adapter.initialize()
  return success ? adapter : null
}
