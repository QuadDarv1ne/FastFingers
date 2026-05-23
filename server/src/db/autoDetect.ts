import net from 'net'
import fs from 'fs'
import path from 'path'
import { DatabaseConfig, DatabaseType } from './types'

/**
 * Check if a TCP port is available/open
 */
function checkPort(port: number, host = 'localhost'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    const timeout = setTimeout(() => {
      socket.destroy()
      resolve(false)
    }, 1000)

    socket.on('connect', () => {
      clearTimeout(timeout)
      socket.destroy()
      resolve(true)
    })

    socket.on('error', () => {
      clearTimeout(timeout)
      resolve(false)
    })

    socket.connect(port, host)
  })
}

/**
 * Check if SQLite is available (always available as it's file-based)
 */
function checkSQLite(dbDir: string): boolean {
  try {
    fs.accessSync(dbDir, fs.constants.W_OK)
    return true
  } catch {
    return false
  }
}

/**
 * Auto-detect available databases by scanning ports and checking availability
 */
export async function autoDetectDatabase(dbDir: string): Promise<DatabaseConfig> {
  const results: { type: DatabaseType; available: boolean; port?: number; score: number }[] = []

  // Check PostgreSQL (default port 5432)
  const pgAvailable = await checkPort(5432)
  if (pgAvailable) {
    results.push({ type: 'postgresql', available: true, port: 5432, score: 90 })
  }

  // Check MongoDB (default port 27017)
  const mongoAvailable = await checkPort(27017)
  if (mongoAvailable) {
    results.push({ type: 'mongodb', available: true, port: 27017, score: 80 })
  }

  // Check SQLite (file-based, always available if directory is writable)
  const sqliteAvailable = checkSQLite(dbDir)
  if (sqliteAvailable) {
    results.push({ type: 'sqlite', available: true, score: 70 })
  }

  // Select the best available database by score
  const available = results.filter((r) => r.available)
  if (available.length === 0) {
    // Fallback: try to use SQLite anyway (will create directory if needed)
    return {
      type: 'sqlite',
      optimal: false,
      autoDetected: true,
    }
  }

  const best = available.sort((a, b) => b.score - a.score)[0]

  const config: DatabaseConfig = {
    type: best.type,
    optimal: true,
    autoDetected: true,
  }

  if (best.port) {
    config.port = best.port
  }

  return config
}

/**
 * Get optimal configuration settings for a database type
 */
export function getOptimalConfig(type: DatabaseType): Record<string, unknown> {
  switch (type) {
    case 'sqlite':
      return {
        filename: 'fastfingers.db',
        pragma: {
          journal_mode: 'WAL',
          synchronous: 'NORMAL',
          cache_size: -64000, // 64MB
          foreign_keys: true,
          busy_timeout: 5000,
        },
      }
    case 'postgresql':
      return {
        max: 20, // connection pool size
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        statement_timeout: 10000,
      }
    case 'mongodb':
      return {
        maxPoolSize: 50,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    default:
      return {}
  }
}
