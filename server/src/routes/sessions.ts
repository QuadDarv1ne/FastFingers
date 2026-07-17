import { Router, Request, Response } from 'express'
import { IDatabaseAdapter, TypingSessionRecord } from '../db/types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function isValidSession(s: Record<string, unknown>): boolean {
  return (
    isFiniteNumber(s.wpm) && s.wpm >= 0 &&
    isFiniteNumber(s.cpm) && s.cpm >= 0 &&
    isFiniteNumber(s.accuracy) && s.accuracy >= 0 && s.accuracy <= 100 &&
    isFiniteNumber(s.errors) && s.errors >= 0 &&
    isFiniteNumber(s.total_chars) && s.total_chars >= 0 &&
    isFiniteNumber(s.duration) && s.duration > 0 &&
    typeof s.date === 'string' && s.date.length > 0
  )
}

export function sessionsRouter(db: IDatabaseAdapter): Router {
  const router = Router()

  router.post('/', async (req: Request, res: Response) => {
    try {
      const session = req.body as Omit<TypingSessionRecord, 'id'>
      if (!session.user_id || !UUID_RE.test(session.user_id)) {
        res.status(400).json({ error: 'Invalid user_id' })
        return
      }
      if (!isValidSession(session as unknown as Record<string, unknown>)) {
        res.status(400).json({ error: 'Invalid session data: wpm, cpm, accuracy, errors, total_chars, duration, and date are required and must be valid' })
        return
      }
      const result = await db.insertSession(session)
      res.status(201).json({ success: true, id: result.insertId })
    } catch {
      res.status(500).json({ error: 'Internal server error' })
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
    } catch {
      res.status(500).json({ error: 'Internal server error' })
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
    } catch {
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  return router
}
