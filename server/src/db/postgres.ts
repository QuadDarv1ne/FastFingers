import { Pool, QueryResult as PgQueryResult } from 'pg'
import {
  IDatabaseAdapter,
  DatabaseType,
  QueryResult,
  TypingSessionRecord,
  UserStatsRecord,
  AchievementRecord,
  LeaderboardEntry,
  HardcoreRecord,
  DatabaseStats,
} from './types'

export class PostgreSQLAdapter implements IDatabaseAdapter {
  private pool: Pool | null = null
  private connectionString: string
  private config: Record<string, unknown>

  constructor(connectionString: string, config: Record<string, unknown> = {}) {
    this.connectionString = connectionString
    this.config = config
  }

  async connect(): Promise<void> {
    this.pool = new Pool({
      connectionString: this.connectionString,
      max: (this.config.max as number) ?? 20,
      idleTimeoutMillis: (this.config.idleTimeoutMillis as number) ?? 30000,
      connectionTimeoutMillis: (this.config.connectionTimeoutMillis as number) ?? 2000,
    })
    // Test connection
    await this.pool.query('SELECT 1')
  }

  async disconnect(): Promise<void> {
    await this.pool?.end()
    this.pool = null
  }

  isConnected(): boolean {
    return this.pool !== null
  }

  getType(): DatabaseType {
    return 'postgresql'
  }

  async migrate(): Promise<void> {
    if (!this.pool) throw new Error('Database not connected')

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS typing_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        wpm REAL NOT NULL,
        cpm REAL NOT NULL,
        accuracy REAL NOT NULL,
        errors INTEGER NOT NULL,
        total_chars INTEGER NOT NULL,
        duration REAL NOT NULL,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        xp REAL DEFAULT 0,
        rhythm_score REAL,
        finger_balance REAL,
        error_recovery REAL,
        session_efficiency REAL
      );

      CREATE TABLE IF NOT EXISTS user_stats (
        user_id UUID PRIMARY KEY,
        total_xp REAL DEFAULT 0,
        level INTEGER DEFAULT 1,
        best_wpm REAL DEFAULT 0,
        best_accuracy REAL DEFAULT 0,
        total_words_typed INTEGER DEFAULT 0,
        total_practice_time REAL DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        completed_challenges JSONB DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS achievements (
        user_id UUID NOT NULL,
        achievement_id TEXT NOT NULL,
        unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        metadata JSONB,
        PRIMARY KEY (user_id, achievement_id)
      );

      CREATE TABLE IF NOT EXISTS leaderboards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        game_mode TEXT NOT NULL,
        wpm REAL NOT NULL,
        score REAL NOT NULL,
        season TEXT,
        date TIMESTAMP WITH TIME ZONE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS hardcore_records (
        user_id UUID PRIMARY KEY,
        streak INTEGER DEFAULT 0,
        wpm REAL DEFAULT 0,
        accuracy REAL DEFAULT 0,
        date TIMESTAMP WITH TIME ZONE NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON typing_sessions(user_id, date DESC);
      CREATE INDEX IF NOT EXISTS idx_leaderboard_mode_score ON leaderboards(game_mode, score DESC);
    `)
  }

  async insertSession(session: Omit<TypingSessionRecord, 'id'>): Promise<QueryResult> {
    if (!this.pool) throw new Error('Database not connected')
    const result = await this.pool.query(
      `INSERT INTO typing_sessions (user_id, wpm, cpm, accuracy, errors, total_chars, duration, date, xp, rhythm_score, finger_balance, error_recovery, session_efficiency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
      [
        session.user_id, session.wpm, session.cpm, session.accuracy, session.errors,
        session.total_chars, session.duration, session.date, session.xp ?? 0,
        session.rhythm_score, session.finger_balance, session.error_recovery, session.session_efficiency,
      ]
    )
    return { rows: [], affectedRows: result.rowCount ?? 0, insertId: result.rows[0]?.id }
  }

  async getSessions(userId: string, limit = 100, offset = 0): Promise<QueryResult<TypingSessionRecord[]>> {
    if (!this.pool) throw new Error('Database not connected')
    const result = await this.pool.query(
      'SELECT * FROM typing_sessions WHERE user_id = $1 ORDER BY date DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    )
    return { rows: result.rows as TypingSessionRecord[] }
  }

  async deleteOldSessions(userId: string, maxAge: number): Promise<QueryResult> {
    if (!this.pool) throw new Error('Database not connected')
    const cutoff = new Date(Date.now() - maxAge)
    const result = await this.pool.query(
      'DELETE FROM typing_sessions WHERE user_id = $1 AND date < $2',
      [userId, cutoff]
    )
    return { rows: [], affectedRows: result.rowCount ?? 0 }
  }

  async upsertUserStats(stats: UserStatsRecord): Promise<QueryResult> {
    if (!this.pool) throw new Error('Database not connected')
    const completedChallenges = Array.isArray(stats.completed_challenges)
      ? JSON.stringify(stats.completed_challenges)
      : stats.completed_challenges
    const result = await this.pool.query(
      `INSERT INTO user_stats (user_id, total_xp, level, best_wpm, best_accuracy, total_words_typed, total_practice_time, current_streak, longest_streak, completed_challenges)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT(user_id) DO UPDATE SET
         total_xp = EXCLUDED.total_xp,
         level = EXCLUDED.level,
         best_wpm = GREATEST(user_stats.best_wpm, EXCLUDED.best_wpm),
         best_accuracy = GREATEST(user_stats.best_accuracy, EXCLUDED.best_accuracy),
         total_words_typed = user_stats.total_words_typed + EXCLUDED.total_words_typed,
         total_practice_time = user_stats.total_practice_time + EXCLUDED.total_practice_time,
         current_streak = EXCLUDED.current_streak,
         longest_streak = GREATEST(user_stats.longest_streak, EXCLUDED.longest_streak),
         completed_challenges = EXCLUDED.completed_challenges,
         updated_at = NOW()`,
      [
        stats.user_id, stats.total_xp, stats.level, stats.best_wpm, stats.best_accuracy,
        stats.total_words_typed, stats.total_practice_time, stats.current_streak,
        stats.longest_streak, completedChallenges,
      ]
    )
    return { rows: [], affectedRows: result.rowCount ?? 0 }
  }

  async getUserStats(userId: string): Promise<QueryResult<UserStatsRecord[]>> {
    if (!this.pool) throw new Error('Database not connected')
    const result = await this.pool.query('SELECT * FROM user_stats WHERE user_id = $1', [userId])
    return { rows: result.rows as UserStatsRecord[] }
  }

  async insertAchievement(achievement: Omit<AchievementRecord, 'unlocked_at'>): Promise<QueryResult> {
    if (!this.pool) throw new Error('Database not connected')
    const result = await this.pool.query(
      'INSERT INTO achievements (user_id, achievement_id, metadata) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [achievement.user_id, achievement.achievement_id, achievement.metadata ? JSON.stringify(achievement.metadata) : null]
    )
    return { rows: [], affectedRows: result.rowCount ?? 0 }
  }

  async getAchievements(userId: string): Promise<QueryResult<AchievementRecord[]>> {
    if (!this.pool) throw new Error('Database not connected')
    const result = await this.pool.query('SELECT * FROM achievements WHERE user_id = $1', [userId])
    return { rows: result.rows as AchievementRecord[] }
  }

  async insertLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): Promise<QueryResult> {
    if (!this.pool) throw new Error('Database not connected')
    const result = await this.pool.query(
      'INSERT INTO leaderboards (user_id, game_mode, wpm, score, season, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [entry.user_id, entry.game_mode, entry.wpm, entry.score, entry.season ?? null, entry.date]
    )
    return { rows: [], affectedRows: result.rowCount ?? 0, insertId: result.rows[0]?.id }
  }

  async getLeaderboard(gameMode: string, season?: string, limit = 100): Promise<QueryResult<LeaderboardEntry[]>> {
    if (!this.pool) throw new Error('Database not connected')
    const params: unknown[] = [gameMode]
    let query = 'SELECT * FROM leaderboards WHERE game_mode = $1'
    if (season) {
      params.push(season)
      query += ` AND season = $${params.length}`
    }
    params.push(limit)
    query += ` ORDER BY score DESC LIMIT $${params.length}`
    const result = await this.pool.query(query, params)
    return { rows: result.rows as LeaderboardEntry[] }
  }

  async getUserRank(userId: string, gameMode: string, season?: string): Promise<QueryResult> {
    if (!this.pool) throw new Error('Database not connected')
    const params: unknown[] = [gameMode]
    let whereClause = 'game_mode = $1'
    if (season) {
      params.push(season)
      whereClause += ` AND season = $${params.length}`
    }
    params.push(userId)
    const userIdParam = `$${params.length}`
    params.push(1)
    const limitParam = `$${params.length}`
    const result = await this.pool.query(
      `SELECT user_id, score,
        (SELECT COUNT(*) + 1 FROM leaderboards l2
         WHERE l2.game_mode = l1.game_mode${season ? ' AND l2.season = l1.season' : ''} AND l2.score > l1.score) as rank
       FROM leaderboards l1
       WHERE user_id = ${userIdParam} AND ${whereClause}
       ORDER BY score DESC LIMIT ${limitParam}`,
      params
    )
    return { rows: result.rows }
  }

  async upsertHardcoreRecord(record: HardcoreRecord): Promise<QueryResult> {
    if (!this.pool) throw new Error('Database not connected')
    const result = await this.pool.query(
      `INSERT INTO hardcore_records (user_id, streak, wpm, accuracy, date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT(user_id) DO UPDATE SET
         streak = GREATEST(hardcore_records.streak, EXCLUDED.streak),
         wpm = GREATEST(hardcore_records.wpm, EXCLUDED.wpm),
         accuracy = GREATEST(hardcore_records.accuracy, EXCLUDED.accuracy),
         date = EXCLUDED.date`,
      [record.user_id, record.streak, record.wpm, record.accuracy, record.date]
    )
    return { rows: [], affectedRows: result.rowCount ?? 0 }
  }

  async getHardcoreRecords(userId: string): Promise<QueryResult<HardcoreRecord[]>> {
    if (!this.pool) throw new Error('Database not connected')
    const result = await this.pool.query('SELECT * FROM hardcore_records WHERE user_id = $1', [userId])
    return { rows: result.rows as HardcoreRecord[] }
  }

  async getDatabaseStats(): Promise<DatabaseStats> {
    if (!this.pool) throw new Error('Database not connected')
    const sessions = await this.pool.query('SELECT COUNT(*) as count FROM typing_sessions')
    const users = await this.pool.query('SELECT COUNT(DISTINCT user_id) as count FROM typing_sessions')
    const avgs = await this.pool.query('SELECT AVG(wpm) as avg_wpm, AVG(accuracy) as avg_accuracy FROM typing_sessions')
    return {
      totalSessions: Number(sessions.rows[0]?.count ?? 0),
      totalUsers: Number(users.rows[0]?.count ?? 0),
      avgWpm: Number(avgs.rows[0]?.avg_wpm ?? 0),
      avgAccuracy: Number(avgs.rows[0]?.avg_accuracy ?? 0),
    }
  }
}
