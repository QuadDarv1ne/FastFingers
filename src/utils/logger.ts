/**
 * Безопасный логгер для приложения
 * В production режиме логи не выводятся в консоль
 */

const isDevelopment = import.meta.env.DEV

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
    },
    error: (...args: unknown[]) => {
      if (isDevelopment) {
        console.error(`${prefix} ❌`, ...args)
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
