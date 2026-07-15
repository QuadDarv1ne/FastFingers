import { Router, Request, Response } from 'express'
import { IDatabaseAdapter, UserStatsRecord, HardcoreRecord } from '../db/types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  router.put('/stats', async (req: Request, res: Response) => {
    try {
      const stats = req.body as UserStatsRecord
      if (!stats.user_id || !UUID_RE.test(stats.user_id)) {
        res.status(400).json({ error: 'Invalid user_id' })
        return
      }
      if (typeof stats.total_xp !== 'number' || stats.total_xp < 0) {
        res.status(400).json({ error: 'Invalid total_xp' })
        return
      }
      const result = await db.upsertUserStats(stats)
      res.json({ success: true, affected: result.affectedRows })
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
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
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  router.put('/hardcore', async (req: Request, res: Response) => {
    try {
      const record = req.body as HardcoreRecord
      if (!record.user_id || !UUID_RE.test(record.user_id)) {
        res.status(400).json({ error: 'Invalid user_id' })
        return
      }
      if (typeof record.streak !== 'number' || record.streak < 0) {
        res.status(400).json({ error: 'Invalid streak' })
        return
      }
      const result = await db.upsertHardcoreRecord(record)
      res.json({ success: true, affected: result.affectedRows })
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  return router
}
