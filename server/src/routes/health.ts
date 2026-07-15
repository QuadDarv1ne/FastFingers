import { Router, Request, Response } from 'express'
import { IDatabaseAdapter, DatabaseType } from '../db/types'

interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  database: {
    type: DatabaseType
    connected: boolean
  }
  uptime: number
  timestamp: string
}

export function healthRouter(db: IDatabaseAdapter): Router {
  const router = Router()
  const startTime = Date.now()

  router.get('/', async (_req: Request, res: Response<HealthResponse>) => {
    const connected = db.isConnected()

    res.json({
      status: connected ? 'healthy' : 'unhealthy',
      database: {
        type: db.getType(),
        connected,
      },
      uptime: Math.round((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    })
  })

  router.get('/databases', (_req: Request, res: Response) => {
    res.json({
      available: ['sqlite', 'postgresql', 'mongodb'],
      current: db.getType(),
      autoDetected: true,
    })
  })

  return router
}
