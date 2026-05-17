/**
 * Безопасный логгер для приложения
 * В production режиме ошибки отправляются в Sentry
 */

import * as Sentry from '@sentry/react'

const isDevelopment = import.meta.env.DEV

/**
 * Safely stringify values for Sentry breadcrumbs.
 * Handles circular references and unserializable values without throwing.
 */
function safeStringify(value: unknown): string {
  try {
    const seen = new WeakSet()
    return JSON.stringify(value, (_key, val) => {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) return '[circular]'
        seen.add(val)
      }
      return val
    })
  } catch {
    return '[unserializable]'
  }
}

interface Logger {
  log: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  debug: (...args: unknown[]) => void
}

const createLogger = (namespace?: string): Logger => {
  const prefix = namespace ? `[${namespace}]` : '[App]'

  return {
    log: (...args: unknown[]) => {
      if (isDevelopment) {
        console.info(`${prefix}`, ...args)
      }
    },
    warn: (...args: unknown[]) => {
      if (isDevelopment) {
        console.warn(`${prefix} ⚠️`, ...args)
      }
      // In production, send warnings to Sentry as breadcrumbs
      if (!isDevelopment && args.length > 0) {
        Sentry.addBreadcrumb({
          category: 'warn',
          message: String(args[0]),
          level: 'warning',
          data: args.length > 1 ? { extra: safeStringify(args.slice(1)) } : undefined,
        })
      }
    },
    error: (...args: unknown[]) => {
      if (isDevelopment) {
        console.error(`${prefix} ❌`, ...args)
      }
      // In production, send errors to Sentry
      if (!isDevelopment && args.length > 0) {
        const error = args.find((arg) => arg instanceof Error) as Error | undefined
        if (error) {
          Sentry.captureException(error, {
            extra: { context: args.filter((arg) => !(arg instanceof Error)) },
          })
        } else {
          Sentry.captureMessage(String(args[0]), {
            level: 'error',
            extra: { context: args.slice(1) },
          })
        }
      }
    },
    info: (...args: unknown[]) => {
      if (isDevelopment) {
        console.info(`${prefix} ℹ️`, ...args)
      }
    },
    debug: (...args: unknown[]) => {
      if (isDevelopment) {
        console.info(`${prefix} 🐛`, ...args)
      }
    },
  }
}

export const logger = createLogger()

export const createScopedLogger = (scope: string): Logger => {
  return createLogger(scope)
}

/**
 * Утилита для безопасной обработки ошибок
 * Логгирует ошибку в dev режиме и возвращает fallback значение
 */
export function safeExecute<T>(
  fn: () => T,
  fallback: T,
  errorMessage = 'Operation failed'
): T {
  try {
    return fn()
  } catch (error) {
    logger.error(errorMessage, error)
    return fallback
  }
}

export default logger
