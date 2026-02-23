import * as Sentry from '@sentry/react'

/**
 * Инициализация Sentry для отслеживания ошибок
 * 
 * Для включения:
 * 1. Создайте проект на https://sentry.io
 * 2. Получите DSN из настроек проекта
 * 3. Добавьте VITE_SENTRY_DSN в .env файл
 */

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN

  if (!dsn) {
    // В режиме разработки без DSN просто логируем
    console.warn('Sentry DSN not configured. Set VITE_SENTRY_DSN in .env file')
    return
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    
    // Интеграции
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Настройки трассировки
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Настройки сессионного replay
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    // Фильтрация ошибок
    beforeSend(event, hint) {
      // Игнорируем ошибки в режиме разработки
      if (import.meta.env.DEV) {
        console.error('[Sentry] Error captured:', event)
        return null
      }

      // Игнорируем ошибки расширений браузера
      const error = hint.originalException as Error
      if (error?.message?.includes('extension')) {
        return null
      }

      return event
    },

    // Теги для всех событий
    initialScope: {
      tags: {
        app: 'fastfingers',
        version: '0.1.0',
      },
    },
  })
}

// Экспортируем утилиты
export { Sentry }
export { captureException, captureMessage, setUser } from '@sentry/react'
