import { Router, Request, Response } from 'express'
import { IDatabaseAdapter, TypingSessionRecord } from '../db/types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function sessionsRouter(db: IDatabaseAdapter): Router {
  const router = Router()

  router.post('/', async (req: Request, res: Response) => {
    try {
      const session = req.body as Omit<TypingSessionRecord, 'id'>
      if (!session.user_id || !UUID_RE.test(session.user_id)) {
        res.status(400).json({ error: 'Invalid user_id' })
        return
      }
      const result = await db.insertSession(session)
      res.status(201).json({ success: true, id: result.insertId })
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  router.get('/:userId', async (req: Request, res: Response) => {
    try {
      const userId = String(req.params.userId)
      if (!UUID_RE.test(userId)) {
        res.status(400).json({ error: 'Invalid userId' })
        return
      }
      const limit = Math.min(Math.max(parseInt(String(req.query.limit)) || 100, 1), 1000)
      const offset = Math.max(parseInt(String(req.query.offset)) || 0, 0)
      const result = await db.getSessions(userId, limit, offset)
      res.json(result.rows)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  router.delete('/:userId/old', async (req: Request, res: Response) => {
    try {
      const userId = String(req.params.userId)
      if (!UUID_RE.test(userId)) {
        res.status(400).json({ error: 'Invalid userId' })
        return
      }
      const maxAge = Math.max(parseInt(String(req.query.maxAge)) || 30 * 24 * 60 * 60 * 1000, 0)
      const result = await db.deleteOldSessions(userId, maxAge)
      res.json({ deleted: result.affectedRows })
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  return router
}
