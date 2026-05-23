/**
 * FastFingers Database Types & Interfaces
 */

export interface QueryResult<T = Record<string, unknown>[]> {
  rows: T
  affectedRows?: number
  insertId?: string | number
}

export interface TypingSessionRecord {
  id?: string
  user_id: string
  wpm: number
  cpm: number
  accuracy: number
  errors: number
  total_chars: number
  duration: number
  date: string
  xp?: number
  rhythm_score?: number
  finger_balance?: number
  error_recovery?: number
  session_efficiency?: number
}

export interface UserStatsRecord {
  user_id: string
  total_xp: number
  level: number
  best_wpm: number
  best_accuracy: number
  total_words_typed: number
  total_practice_time: number
  current_streak: number
  longest_streak: number
  completed_challenges: string[]
  updated_at?: string
}

export interface AchievementRecord {
  user_id: string
  achievement_id: string
  unlocked_at: string
  metadata?: Record<string, unknown>
}

export interface LeaderboardEntry {
  id?: string
  user_id: string
  game_mode: string
  wpm: number
  score: number
  season?: string
  date: string
}

export interface HardcoreRecord {
  user_id: string
  streak: number
  wpm: number
  accuracy: number
  date: string
}

export interface DatabaseStats {
  totalSessions: number
  totalUsers: number
  avgWpm: number
  avgAccuracy: number
}

export type DatabaseType = 'sqlite' | 'postgresql' | 'mongodb'

export interface DatabaseConfig {
  type: DatabaseType
  optimal: boolean
  autoDetected: boolean
  port?: number
  connectionString?: string
}

export interface IDatabaseAdapter {
  connect(): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean
  getType(): DatabaseType

  // Sessions
  insertSession(session: Omit<TypingSessionRecord, 'id'>): Promise<QueryResult>
  getSessions(userId: string, limit?: number, offset?: number): Promise<QueryResult<TypingSessionRecord[]>>
  deleteOldSessions(userId: string, maxAge: number): Promise<QueryResult>

  // User Stats
  upsertUserStats(stats: UserStatsRecord): Promise<QueryResult>
  getUserStats(userId: string): Promise<QueryResult<UserStatsRecord[]>>

  // Achievements
  insertAchievement(achievement: Omit<AchievementRecord, 'unlocked_at'>): Promise<QueryResult>
  getAchievements(userId: string): Promise<QueryResult<AchievementRecord[]>>

  // Leaderboard
  insertLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): Promise<QueryResult>
  getLeaderboard(gameMode: string, season?: string, limit?: number): Promise<QueryResult<LeaderboardEntry[]>>
  getUserRank(userId: string, gameMode: string, season?: string): Promise<QueryResult>

  // Hardcore
  upsertHardcoreRecord(record: HardcoreRecord): Promise<QueryResult>
  getHardcoreRecords(userId: string): Promise<QueryResult<HardcoreRecord[]>>

  // Stats
  getDatabaseStats(): Promise<DatabaseStats>

  // Migrations
  migrate(): Promise<void>
}
