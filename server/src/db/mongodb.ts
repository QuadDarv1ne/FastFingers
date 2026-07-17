import { MongoClient, Db, ObjectId } from 'mongodb'
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

export class MongoDBAdapter implements IDatabaseAdapter {
  private client: MongoClient | null = null
  private db: Db | null = null
  private connectionString: string
  private config: Record<string, unknown>

  constructor(connectionString: string, config: Record<string, unknown> = {}) {
    this.connectionString = connectionString
    this.config = config
  }

  // Safe JSON parse with fallback — prevents crashes from malformed data
  private safeParseJSON<T>(value: unknown, fallback: T): T {
    if (typeof value !== 'string') return fallback
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }

  // Map raw MongoDB document to typed record with validation
  private toTypingSession(doc: Record<string, unknown>): TypingSessionRecord {
    return {
      id: (doc._id as ObjectId)?.toString() ?? '',
      user_id: String(doc.user_id ?? ''),
      date: doc.date instanceof Date ? doc.date.toISOString() : String(doc.date ?? ''),
      wpm: Number(doc.wpm ?? 0),
      cpm: Number(doc.cpm ?? 0),
      accuracy: Number(doc.accuracy ?? 0),
      errors: Number(doc.errors ?? 0),
      total_chars: Number(doc.total_chars ?? 0),
      duration: Number(doc.duration ?? 0),
      xp: doc.xp != null ? Number(doc.xp) : undefined,
      rhythm_score: doc.rhythm_score != null ? Number(doc.rhythm_score) : undefined,
      finger_balance: doc.finger_balance != null ? Number(doc.finger_balance) : undefined,
      error_recovery: doc.error_recovery != null ? Number(doc.error_recovery) : undefined,
      session_efficiency: doc.session_efficiency != null ? Number(doc.session_efficiency) : undefined,
    } as unknown as TypingSessionRecord
  }

  private toUserStats(doc: Record<string, unknown>): UserStatsRecord {
    return {
      user_id: String(doc.user_id ?? ''),
      total_xp: Number(doc.total_xp ?? 0),
      level: Number(doc.level ?? 1),
      best_wpm: Number(doc.best_wpm ?? 0),
      best_accuracy: Number(doc.best_accuracy ?? 0),
      total_words_typed: Number(doc.total_words_typed ?? 0),
      total_practice_time: Number(doc.total_practice_time ?? 0),
      current_streak: Number(doc.current_streak ?? 0),
      longest_streak: Number(doc.longest_streak ?? 0),
      completed_challenges: Array.isArray(doc.completed_challenges) ? doc.completed_challenges.map(String) : [],
      updated_at: doc.updated_at instanceof Date ? doc.updated_at.toISOString() : String(doc.updated_at ?? ''),
    } as unknown as UserStatsRecord
  }

  private toAchievement(doc: Record<string, unknown>): AchievementRecord {
    return {
      user_id: String(doc.user_id ?? ''),
      achievement_id: String(doc.achievement_id ?? ''),
      unlocked_at: doc.unlocked_at instanceof Date ? doc.unlocked_at.toISOString() : String(doc.unlocked_at ?? ''),
      metadata: doc.metadata as Record<string, unknown> | undefined,
    } as unknown as AchievementRecord
  }

  private toLeaderboardEntry(doc: Record<string, unknown>): LeaderboardEntry {
    return {
      id: (doc._id as ObjectId)?.toString() ?? '',
      user_id: String(doc.user_id ?? ''),
      game_mode: String(doc.game_mode ?? ''),
      wpm: Number(doc.wpm ?? 0),
      score: Number(doc.score ?? 0),
      season: doc.season != null ? String(doc.season) : undefined,
      date: doc.date instanceof Date ? doc.date.toISOString() : String(doc.date ?? ''),
    } as unknown as LeaderboardEntry
  }

  private toHardcoreRecord(doc: Record<string, unknown>): HardcoreRecord {
    return {
      user_id: String(doc.user_id ?? ''),
      streak: Number(doc.streak ?? 0),
      wpm: Number(doc.wpm ?? 0),
      accuracy: Number(doc.accuracy ?? 0),
      date: doc.date instanceof Date ? doc.date.toISOString() : String(doc.date ?? ''),
    } as unknown as HardcoreRecord
  }

  async connect(): Promise<void> {
    this.client = new MongoClient(this.connectionString, {
      maxPoolSize: (this.config.maxPoolSize as number) ?? 50,
      minPoolSize: (this.config.minPoolSize as number) ?? 5,
      maxIdleTimeMS: (this.config.maxIdleTimeMS as number) ?? 30000,
      serverSelectionTimeoutMS: (this.config.serverSelectionTimeoutMS as number) ?? 5000,
    })
    await this.client.connect()
    this.db = this.client.db()
  }

  async disconnect(): Promise<void> {
    await this.client?.close()
    this.client = null
    this.db = null
  }

  isConnected(): boolean {
    return this.client !== null && this.db !== null
  }

  getType(): DatabaseType {
    return 'mongodb'
  }

  async migrate(): Promise<void> {
    if (!this.db) throw new Error('Database not connected')

    // Create collections and indexes
    await this.db.createCollection('typing_sessions')
    await this.db.collection('typing_sessions').createIndex({ user_id: 1, date: -1 })

    await this.db.createCollection('user_stats')
    await this.db.collection('user_stats').createIndex({ user_id: 1 }, { unique: true })

    await this.db.createCollection('achievements')
    await this.db.collection('achievements').createIndex({ user_id: 1, achievement_id: 1 }, { unique: true })

    await this.db.createCollection('leaderboards')
    await this.db.collection('leaderboards').createIndex({ game_mode: 1, score: -1 })

    await this.db.createCollection('hardcore_records')
    await this.db.collection('hardcore_records').createIndex({ user_id: 1 }, { unique: true })
  }

  async insertSession(session: Omit<TypingSessionRecord, 'id'>): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not connected')
    const result = await this.db.collection('typing_sessions').insertOne(session as Record<string, unknown>)
    return { rows: [], affectedRows: 1, insertId: result.insertedId.toString() }
  }

  async getSessions(userId: string, limit = 100, offset = 0): Promise<QueryResult<TypingSessionRecord[]>> {
    if (!this.db) throw new Error('Database not connected')
    const rows = await this.db.collection('typing_sessions')
      .find({ user_id: userId })
      .sort({ date: -1 })
      .skip(offset)
      .limit(limit)
      .toArray()
    return { rows: rows.map(doc => this.toTypingSession(doc as Record<string, unknown>)) }
  }

  async deleteOldSessions(userId: string, maxAge: number): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not connected')
    const cutoff = new Date(Date.now() - maxAge)
    const result = await this.db.collection('typing_sessions').deleteMany({
      user_id: userId,
      date: { $lt: cutoff },
    })
    return { rows: [], affectedRows: result.deletedCount }
  }

  async upsertUserStats(stats: UserStatsRecord): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not connected')
    const { user_id, ...updateData } = stats
    const result = await this.db.collection('user_stats').updateOne(
      { user_id },
      {
        $set: {
          ...updateData,
          completed_challenges: Array.isArray(stats.completed_challenges)
            ? stats.completed_challenges
            : this.safeParseJSON(stats.completed_challenges, []),
          updated_at: new Date(),
        },
        $inc: {
          total_words_typed: stats.total_words_typed,
          total_practice_time: stats.total_practice_time,
        },
        $max: {
          best_wpm: stats.best_wpm,
          best_accuracy: stats.best_accuracy,
          longest_streak: stats.longest_streak,
        },
      },
      { upsert: true }
    )
    return { rows: [], affectedRows: result.modifiedCount + result.upsertedCount }
  }

  async getUserStats(userId: string): Promise<QueryResult<UserStatsRecord[]>> {
    if (!this.db) throw new Error('Database not connected')
    const row = await this.db.collection('user_stats').findOne({ user_id: userId })
    return { rows: row ? [this.toUserStats(row as Record<string, unknown>)] : [] }
  }

  async insertAchievement(achievement: Omit<AchievementRecord, 'unlocked_at'>): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not connected')
    const result = await this.db.collection('achievements').updateOne(
      { user_id: achievement.user_id, achievement_id: achievement.achievement_id },
      {
        $setOnInsert: {
          user_id: achievement.user_id,
          achievement_id: achievement.achievement_id,
          unlocked_at: new Date(),
          metadata: achievement.metadata ?? null,
        },
      },
      { upsert: true }
    )
    return { rows: [], affectedRows: result.upsertedCount + result.modifiedCount }
  }

  async getAchievements(userId: string): Promise<QueryResult<AchievementRecord[]>> {
    if (!this.db) throw new Error('Database not connected')
    const rows = await this.db.collection('achievements').find({ user_id: userId }).toArray()
    return { rows: rows.map(doc => this.toAchievement(doc as Record<string, unknown>)) }
  }

  async insertLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not connected')
    const result = await this.db.collection('leaderboards').insertOne(entry as Record<string, unknown>)
    return { rows: [], affectedRows: 1, insertId: result.insertedId.toString() }
  }

  async getLeaderboard(gameMode: string, season?: string, limit = 100): Promise<QueryResult<LeaderboardEntry[]>> {
    if (!this.db) throw new Error('Database not connected')
    const query: Record<string, unknown> = { game_mode: gameMode }
    if (season) query.season = season
    const rows = await this.db.collection('leaderboards')
      .find(query)
      .sort({ score: -1 })
      .limit(limit)
      .toArray()
    return { rows: rows.map(doc => this.toLeaderboardEntry(doc as Record<string, unknown>)) }
  }

  async getUserRank(userId: string, gameMode: string, season?: string): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not connected')
    const matchStage: Record<string, unknown> = { game_mode: gameMode }
    if (season) matchStage.season = season

    const userEntry = await this.db.collection('leaderboards').findOne({ user_id: userId, ...matchStage })
    if (!userEntry) return { rows: [] }

    const betterCount = await this.db.collection('leaderboards').countDocuments({
      ...matchStage,
      score: { $gt: userEntry.score },
    })

    return { rows: [{ user_id: userId, score: userEntry.score, rank: betterCount + 1 }] }
  }

  async upsertHardcoreRecord(record: HardcoreRecord): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not connected')
    const result = await this.db.collection('hardcore_records').updateOne(
      { user_id: record.user_id },
      {
        $set: { date: record.date },
        $max: {
          streak: record.streak,
          wpm: record.wpm,
          accuracy: record.accuracy,
        },
      },
      { upsert: true }
    )
    return { rows: [], affectedRows: result.modifiedCount + result.upsertedCount }
  }

  async getHardcoreRecords(userId: string): Promise<QueryResult<HardcoreRecord[]>> {
    if (!this.db) throw new Error('Database not connected')
    const row = await this.db.collection('hardcore_records').findOne({ user_id: userId })
    return { rows: row ? [this.toHardcoreRecord(row as Record<string, unknown>)] : [] }
  }

  async getDatabaseStats(): Promise<DatabaseStats> {
    if (!this.db) throw new Error('Database not connected')
    const totalSessions = await this.db.collection('typing_sessions').countDocuments()
    const totalUsers = await this.db.collection('typing_sessions').distinct('user_id').then(arr => arr.length)
    const avgPipeline = await this.db.collection('typing_sessions').aggregate([
      { $group: { _id: null, avg_wpm: { $avg: '$wpm' }, avg_accuracy: { $avg: '$accuracy' } } },
    ]).toArray()
    return {
      totalSessions,
      totalUsers,
      avgWpm: avgPipeline[0]?.avg_wpm ?? 0,
      avgAccuracy: avgPipeline[0]?.avg_accuracy ?? 0,
    }
  }
}
