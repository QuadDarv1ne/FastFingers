import { Router, Request, Response } from 'express'
import { IDatabaseAdapter, UserStatsRecord, HardcoreRecord } from '../db/types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function isNonNegative(v: unknown): v is number {
  return isFiniteNumber(v) && v >= 0
}

export function progressRouter(db: IDatabaseAdapter): Router {
  const router = Router()

  router.get('/stats/:userId', async (req: Request, res: Response) => {
    try {
      const userId = String(req.params.userId)
      if (!UUID_RE.test(userId)) {
        res.status(400).json({ error: 'Invalid userId' })
        return
      }
      const result = await db.getUserStats(userId)
      res.json(result.rows[0] ?? null)
    } catch {
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  router.put('/stats', async (req: Request, res: Response) => {
    try {
      const stats = req.body as UserStatsRecord
      if (!stats.user_id || !UUID_RE.test(stats.user_id)) {
        res.status(400).json({ error: 'Invalid user_id' })
        return
      }
      if (!isNonNegative(stats.total_xp)) {
        res.status(400).json({ error: 'Invalid total_xp: must be a non-negative number' })
        return
      }
      if (!isNonNegative(stats.total_words_typed)) {
        res.status(400).json({ error: 'Invalid total_words_typed: must be a non-negative number' })
        return
      }
      if (!isNonNegative(stats.total_practice_time)) {
        res.status(400).json({ error: 'Invalid total_practice_time: must be a non-negative number' })
        return
      }
      const result = await db.upsertUserStats(stats)
      res.json({ success: true, affected: result.affectedRows })
    } catch {
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  router.get('/hardcore/:userId', async (req: Request, res: Response) => {
    try {
      const userId = String(req.params.userId)
      if (!UUID_RE.test(userId)) {
        res.status(400).json({ error: 'Invalid userId' })
        return
      }
      const result = await db.getHardcoreRecords(userId)
      res.json(result.rows)
    } catch {
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  router.put('/hardcore', async (req: Request, res: Response) => {
    try {
      const record = req.body as HardcoreRecord
      if (!record.user_id || !UUID_RE.test(record.user_id)) {
        res.status(400).json({ error: 'Invalid user_id' })
        return
      }
      if (!isNonNegative(record.streak)) {
        res.status(400).json({ error: 'Invalid streak: must be a non-negative number' })
        return
      }
      if (!isFiniteNumber(record.wpm) || record.wpm < 0) {
        res.status(400).json({ error: 'Invalid wpm: must be a non-negative number' })
        return
      }
      if (!isFiniteNumber(record.accuracy) || record.accuracy < 0 || record.accuracy > 100) {
        res.status(400).json({ error: 'Invalid accuracy: must be between 0 and 100' })
        return
      }
      if (typeof record.date !== 'string' || record.date.length === 0) {
        res.status(400).json({ error: 'Invalid date' })
        return
      }
      const result = await db.upsertHardcoreRecord(record)
      res.json({ success: true, affected: result.affectedRows })
    } catch {
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  return router
}
