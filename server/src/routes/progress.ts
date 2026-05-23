import { Router, Request, Response } from 'express'
import { IDatabaseAdapter, UserStatsRecord, HardcoreRecord } from '../db/types'

export function progressRouter(db: IDatabaseAdapter): Router {
  const router = Router()

  router.get('/stats/:userId', async (req: Request, res: Response) => {
    try {
      const result = await db.getUserStats(req.params.userId)
      res.json(result.rows[0] ?? null)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  router.put('/stats', async (req: Request, res: Response) => {
    try {
      const stats = req.body as UserStatsRecord
      const result = await db.upsertUserStats(stats)
      res.json({ success: true, affected: result.affectedRows })
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  router.get('/hardcore/:userId', async (req: Request, res: Response) => {
    try {
      const result = await db.getHardcoreRecords(req.params.userId)
      res.json(result.rows)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  router.put('/hardcore', async (req: Request, res: Response) => {
    try {
      const record = req.body as HardcoreRecord
      const result = await db.upsertHardcoreRecord(record)
      res.json({ success: true, affected: result.affectedRows })
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  return router
}
