import { Router, Request, Response } from 'express'
import { IDatabaseAdapter, TypingSessionRecord } from '../db/types'

export function sessionsRouter(db: IDatabaseAdapter): Router {
  const router = Router()

  router.post('/', async (req: Request, res: Response) => {
    try {
      const session = req.body as Omit<TypingSessionRecord, 'id'>
      const result = await db.insertSession(session)
      res.status(201).json({ success: true, id: result.insertId })
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  router.get('/:userId', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string
      const limit = parseInt(req.query.limit as string) || 100
      const offset = parseInt(req.query.offset as string) || 0
      const result = await db.getSessions(userId, limit, offset)
      res.json(result.rows)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  router.delete('/:userId/old', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string
      const maxAge = parseInt(req.query.maxAge as string) || 30 * 24 * 60 * 60 * 1000 // 30 days
      const result = await db.deleteOldSessions(userId, maxAge)
      res.json({ deleted: result.affectedRows })
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  return router
}
