import Database from 'better-sqlite3'
import path from 'path'
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

export class SQLiteAdapter implements IDatabaseAdapter {
  private db: Database.Database | null = null
  private dbPath: string
  private config: Record<string, unknown>

  constructor(dbPath: string, config: Record<string, unknown> = {}) {
    this.dbPath = dbPath
    this.config = config
  }

  async connect(): Promise<void> {
    this.db = new Database(this.dbPath)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('synchronous = NORMAL')
    this.db.pragma('cache_size = -64000')
    this.db.pragma('foreign_keys = ON')
    this.db.pragma('busy_timeout = 5000')
  }

  async disconnect(): Promise<void> {
    this.db?.close()
    this.db = null
  }

  isConnected(): boolean {
    return this.db !== null
  }

  getType(): DatabaseType {
    return 'sqlite'
  }

  async migrate(): Promise<void> {
    if (!this.db) throw new Error('Database not connected')

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS typing_sessions (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL,
        wpm REAL NOT NULL,
        cpm REAL NOT NULL,
        accuracy REAL NOT NULL,
        errors INTEGER NOT NULL,
        total_chars INTEGER NOT NULL,
        duration REAL NOT NULL,
        date TEXT NOT NULL,
        xp REAL DEFAULT 0,
        rhythm_score REAL,
        finger_balance REAL,
        error_recovery REAL,
        session_efficiency REAL
      );

      CREATE TABLE IF NOT EXISTS user_stats (
        user_id TEXT PRIMARY KEY,
        total_xp REAL DEFAULT 0,
        level INTEGER DEFAULT 1,
        best_wpm REAL DEFAULT 0,
        best_accuracy REAL DEFAULT 0,
        total_words_typed INTEGER DEFAULT 0,
        total_practice_time REAL DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        completed_challenges TEXT DEFAULT '[]',
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS achievements (
        user_id TEXT NOT NULL,
        achievement_id TEXT NOT NULL,
        unlocked_at TEXT DEFAULT (datetime('now')),
        metadata TEXT,
        PRIMARY KEY (user_id, achievement_id)
      );

      CREATE TABLE IF NOT EXISTS leaderboards (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL,
        game_mode TEXT NOT NULL,
        wpm REAL NOT NULL,
        score REAL NOT NULL,
        season TEXT,
        date TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS hardcore_records (
        user_id TEXT PRIMARY KEY,
        streak INTEGER DEFAULT 0,
        wpm REAL DEFAULT 0,
        accuracy REAL DEFAULT 0,
        date TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_user ON typing_sessions(user_id, date DESC);
      CREATE INDEX IF NOT EXISTS idx_leaderboard_mode ON leaderboards(game_mode, score DESC);
    `)
  }

  async insertSession(session: Omit<TypingSessionRecord, 'id'>): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not connected')
    const stmt = this.db.prepare(`
      INSERT INTO typing_sessions (user_id, wpm, cpm, accuracy, errors, total_chars, duration, date, xp, rhythm_score, finger_balance, error_recovery, session_efficiency)
      VALUES (@user_id, @wpm, @cpm, @accuracy, @errors, @total_chars, @duration, @date, @xp, @rhythm_score, @finger_balance, @error_recovery, @session_efficiency)
    `)
    const result = stmt.run(session)
    return { rows: [], affectedRows: result.changes, insertId: result.lastInsertRowid as string | number }
  }

  async getSessions(userId: string, limit = 100, offset = 0): Promise<QueryResult<TypingSessionRecord[]>> {
    if (!this.db) throw new Error('Database not connected')
    const rows = this.db.prepare(
      'SELECT * FROM typing_sessions WHERE user_id = ? ORDER BY date DESC LIMIT ? OFFSET ?'
    ).all(userId, limit, offset) as TypingSessionRecord[]
    return { rows }
  }

  async deleteOldSessions(userId: string, maxAge: number): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not connected')
    const cutoff = new Date(Date.now() - maxAge).toISOString()
    const result = this.db.prepare('DELETE FROM typing_sessions WHERE user_id = ? AND date < ?').run(userId, cutoff)
    return { rows: [], affectedRows: result.changes }
  }

  async upsertUserStats(stats: UserStatsRecord): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not connected')
    const stmt = this.db.prepare(`
      INSERT INTO user_stats (user_id, total_xp, level, best_wpm, best_accuracy, total_words_typed, total_practice_time, current_streak, longest_streak, completed_challenges)
      VALUES (@user_id, @total_xp, @level, @best_wpm, @best_accuracy, @total_words_typed, @total_practice_time, @current_streak, @longest_streak, @completed_challenges)
      ON CONFLICT(user_id) DO UPDATE SET
        total_xp = excluded.total_xp,
        level = excluded.level,
        best_wpm = MAX(best_wpm, excluded.best_wpm),
        best_accuracy = MAX(best_accuracy, excluded.best_accuracy),
        total_words_typed = total_words_typed + excluded.total_words_typed,
        total_practice_time = total_practice_time + excluded.total_practice_time,
        current_streak = excluded.current_streak,
        longest_streak = MAX(longest_streak, excluded.longest_streak),
        completed_challenges = excluded.completed_challenges,
        updated_at = datetime('now')
    `)
    const completedChallenges = Array.isArray(stats.completed_challenges)
      ? JSON.stringify(stats.completed_challenges)
      : stats.completed_challenges
    const result = stmt.run({ ...stats, completed_challenges: completedChallenges })
    return { rows: [], affectedRows: result.changes }
  }

  async getUserStats(userId: string): Promise<QueryResult<UserStatsRecord[]>> {
    if (!this.db) throw new Error('Database not connected')
    const rows = this.db.prepare('SELECT * FROM user_stats WHERE user_id = ?').all(userId) as UserStatsRecord[]
    return { rows }
  }

  async insertAchievement(achievement: Omit<AchievementRecord, 'unlocked_at'>): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not connected')
    const metadata = achievement.metadata ? JSON.stringify(achievement.metadata) : null
    const stmt = this.db.prepare(
      'INSERT OR IGNORE INTO achievements (user_id, achievement_id, metadata) VALUES (?, ?, ?)'
    )
    const result = stmt.run(achievement.user_id, achievement.achievement_id, metadata)
    return { rows: [], affectedRows: result.changes }
  }

  async getAchievements(userId: string): Promise<QueryResult<AchievementRecord[]>> {
    if (!this.db) throw new Error('Database not connected')
    const rows = this.db.prepare(
      'SELECT *, json_each.value FROM achievements WHERE user_id = ?'
    ).all(userId) as AchievementRecord[]
    return { rows }
  }

  async insertLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not connected')
    const stmt = this.db.prepare(
      'INSERT INTO leaderboards (user_id, game_mode, wpm, score, season, date) VALUES (@user_id, @game_mode, @wpm, @score, @season, @date)'
    )
    const result = stmt.run(entry)
    return { rows: [], affectedRows: result.changes, insertId: result.lastInsertRowid as string | number }
  }

  async getLeaderboard(
    gameMode: string,
    season?: string,
    limit = 100
  ): Promise<QueryResult<LeaderboardEntry[]>> {
    if (!this.db) throw new Error('Database not connected')
    let query = 'SELECT * FROM leaderboards WHERE game_mode = ?'
    const params: unknown[] = [gameMode, limit]
    if (season) {
      query += ' AND season = ?'
      params.splice(1, 0, season)
    }
    query += ' ORDER BY score DESC LIMIT ?'
    const rows = this.db.prepare(query).all(...params) as LeaderboardEntry[]
    return { rows }
  }

  async getUserRank(
    userId: string,
    gameMode: string,
    season?: string
  ): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not connected')
    let query = `
      SELECT user_id, score,
        (SELECT COUNT(*) + 1 FROM leaderboards l2
         WHERE l2.game_mode = ? AND l2.score > l1.score`
    const params: unknown[] = [gameMode]
    if (season) {
      query += ' AND l2.season = ?'
      params.push(season)
    }
    query += ') as rank FROM leaderboards l1 WHERE user_id = ? AND game_mode = ?'
    if (season) {
      query += ' AND season = ?'
    }
    query += ' ORDER BY score DESC LIMIT 1'
    const rows = this.db.prepare(query).all(...params, userId, gameMode)
    return { rows }
  }

  async upsertHardcoreRecord(record: HardcoreRecord): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not connected')
    const stmt = this.db.prepare(`
      INSERT INTO hardcore_records (user_id, streak, wpm, accuracy, date)
      VALUES (@user_id, @streak, @wpm, @accuracy, @date)
      ON CONFLICT(user_id) DO UPDATE SET
        streak = MAX(streak, excluded.streak),
        wpm = MAX(wpm, excluded.wpm),
        accuracy = MAX(accuracy, excluded.accuracy),
        date = excluded.date
    `)
    const result = stmt.run(record)
    return { rows: [], affectedRows: result.changes }
  }

  async getHardcoreRecords(userId: string): Promise<QueryResult<HardcoreRecord[]>> {
    if (!this.db) throw new Error('Database not connected')
    const rows = this.db.prepare('SELECT * FROM hardcore_records WHERE user_id = ?').all(userId) as HardcoreRecord[]
    return { rows }
  }

  async getDatabaseStats(): Promise<DatabaseStats> {
    if (!this.db) throw new Error('Database not connected')
    const totalSessions = this.db.prepare('SELECT COUNT(*) as count FROM typing_sessions').get() as { count: number }
    const totalUsers = this.db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM typing_sessions').get() as { count: number }
    const avgStats = this.db.prepare('SELECT AVG(wpm) as avg_wpm, AVG(accuracy) as avg_accuracy FROM typing_sessions').get() as { avg_wpm: number | null; avg_accuracy: number | null }
    return {
      totalSessions: totalSessions.count,
      totalUsers: totalUsers.count,
      avgWpm: avgStats.avg_wpm ?? 0,
      avgAccuracy: avgStats.avg_accuracy ?? 0,
    }
  }
}
