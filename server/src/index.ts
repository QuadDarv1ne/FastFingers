import express from 'express'
import cors from 'cors'
import path from 'path'
import { autoDetectDatabase, getOptimalConfig } from './db/autoDetect'
import { DatabaseConfig, DatabaseType } from './db/types'

// Routes will be added
import { healthRouter } from './routes/health'
import { sessionsRouter } from './routes/sessions'
import { progressRouter } from './routes/progress'

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001

// Middleware
app.use(cors())
app.use(express.json())

// State
let dbConfig: DatabaseConfig | null = null
let dbAdapter: import('./db/types').IDatabaseAdapter | null = null

/**
 * Find an available port starting from the given port
 */
async function findAvailablePort(startPort: number): Promise<number> {
  const net = await import('net')
  for (let port = startPort; port < startPort + 20; port++) {
    const available = await new Promise<boolean>((resolve) => {
      const server = net.createServer()
      server.listen(port, () => {
        server.close(() => resolve(true))
      })
      server.on('error', () => resolve(false))
    })
    if (available) return port
  }
  throw new Error(`No available port found starting from ${startPort}`)
}

/**
 * Initialize database adapter based on detected config
 */
async function initDatabase(config: DatabaseConfig) {
  const optimalConfig = getOptimalConfig(config.type)

  switch (config.type) {
    case 'sqlite': {
      const { SQLiteAdapter } = await import('./db/sqlite')
      const dbPath = path.join(process.cwd(), 'fastfingers.db')
      dbAdapter = new SQLiteAdapter(dbPath, optimalConfig)
      break
    }
    case 'postgresql': {
      const { PostgreSQLAdapter } = await import('./db/postgres')
      const connectionString =
        process.env.DATABASE_URL || `postgresql://postgres:postgres@localhost:5432/fastfingers`
      dbAdapter = new PostgreSQLAdapter(connectionString, optimalConfig)
      break
    }
    case 'mongodb': {
      const { MongoDBAdapter } = await import('./db/mongodb')
      const connectionString =
        process.env.MONGO_URL || `mongodb://localhost:27017/fastfingers`
      dbAdapter = new MongoDBAdapter(connectionString, optimalConfig)
      break
    }
  }

  await dbAdapter.connect()
  await dbAdapter.migrate()
  console.log(`✅ Database connected: ${config.type}`)
}

/**
 * Start the server
 */
async function start() {
  const dbDir = path.join(process.cwd(), 'data')

  // Ensure data directory exists
  try {
    const fs = await import('fs')
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }
  } catch (err) {
    console.warn('⚠️  Could not create data directory:', err)
  }

  // Auto-detect database
  console.log('🔍 Auto-detecting available databases...')
  dbConfig = await autoDetectDatabase(dbDir)
  console.log(`📊 Selected database: ${dbConfig.type} (optimal: ${dbConfig.optimal})`)

  // Initialize database
  try {
    await initDatabase(dbConfig)
  } catch (err) {
    console.warn('⚠️  Failed to connect to auto-detected database, falling back to SQLite')
    dbConfig = { type: 'sqlite', optimal: false, autoDetected: true }
    await initDatabase(dbConfig)
  }

  // Routes
  if (!dbAdapter) {
    console.error('Database adapter not initialized')
    process.exit(1)
  }
  app.use('/api/health', healthRouter(dbAdapter))
  app.use('/api/sessions', sessionsRouter(dbAdapter))
  app.use('/api/progress', progressRouter(dbAdapter))

  // Serve frontend static files (after API routes to avoid conflict)
  const distDir = path.join(__dirname, '..', '..', 'dist')
  app.use(express.static(distDir))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })

  // Start server
  const actualPort = await findAvailablePort(PORT)
  app.listen(actualPort, () => {
    console.log(`🚀 FastFingers server running on http://localhost:${actualPort}`)
    console.log(`📁 Database: ${dbConfig?.type ?? 'unknown'}`)
    console.log(`🔌 API: http://localhost:${actualPort}/api/health`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
