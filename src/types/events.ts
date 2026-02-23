/**
 * Типы для кастомных событий приложения
 * 
 * Использование:
 * 1. Объявите событие в global.d.ts или здесь
 * 2. Создавайте события с правильными типами
 * 3. Обрабатывайте с типизированными callback'ами
 */

// ============================================
// Объявления кастомных событий
// ============================================

/** Событие начала челленджа */
export interface StartChallengeEventDetail {
  challenge: {
    id: string
    text?: string
    targetWpm?: number
    targetAccuracy?: number
  }
}

export type StartChallengeEvent = CustomEvent<StartChallengeEventDetail>

/** Событие завершения тренировки */
export interface TrainingCompleteEventDetail {
  wpm: number
  cpm: number
  accuracy: number
  errors: number
  correctChars: number
  totalChars: number
  timeElapsed: number
}

export type TrainingCompleteEvent = CustomEvent<TrainingCompleteEventDetail>

/** Событие повышения уровня */
export interface LevelUpEventDetail {
  newLevel: number
  previousLevel: number
  xp: number
}

export type LevelUpEvent = CustomEvent<LevelUpEventDetail>

/** Событие достижения */
export interface AchievementUnlockedEventDetail {
  id: string
  title: string
  description: string
  icon: string
}

export type AchievementUnlockedEvent = CustomEvent<AchievementUnlockedEventDetail>

/** Событие изменения темы */
export interface ThemeChangeEventDetail {
  theme: 'light' | 'dark' | 'system'
  resolvedTheme: 'light' | 'dark'
}

export type ThemeChangeEvent = CustomEvent<ThemeChangeEventDetail>

/** Событие изменения языка */
export interface LanguageChangeEventDetail {
  language: string
}

export type LanguageChangeEvent = CustomEvent<LanguageChangeEventDetail>

/** Событие экспорта данных */
export interface DataExportEventDetail {
  timestamp: string
  data: unknown
}

export type DataExportEvent = CustomEvent<DataExportEventDetail>

/** Событие импорта данных */
export interface DataImportEventDetail {
  success: boolean
  error?: string
}

export type DataImportEvent = CustomEvent<DataImportEventDetail>

// ============================================
// Карта всех событий приложения
// ============================================

export interface AppEventMap {
  startChallenge: StartChallengeEvent
  trainingComplete: TrainingCompleteEvent
  levelUp: LevelUpEvent
  achievementUnlocked: AchievementUnlockedEvent
  themeChange: ThemeChangeEvent
  languageChange: LanguageChangeEvent
  dataExport: DataExportEvent
  dataImport: DataImportEvent
}

// ============================================
// Утилиты для работы с событиями
// ============================================

/**
 * Создать типизированное кастомное событие
 * 
 * @example
 * const event = createCustomEvent('startChallenge', { challenge: { id: '1' } })
 * window.dispatchEvent(event)
 */
export function createCustomEvent<K extends keyof AppEventMap>(
  type: K,
  detail: AppEventMap[K]['detail']
): AppEventMap[K] {
  return new CustomEvent(type, { detail }) as AppEventMap[K]
}

/**
 * Добавить обработчик события с правильной типизацией
 * 
 * @example
 * useEvent('startChallenge', (e) => {
 *   console.log(e.detail.challenge.id)
 * })
 */
export function addAppEvent<K extends keyof AppEventMap>(
  type: K,
  handler: (event: AppEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): () => void {
  const wrappedHandler = (event: Event) => {
    handler(event as AppEventMap[K])
  }
  
  window.addEventListener(type, wrappedHandler, options)
  
  // Возвращаем функцию для удаления обработчика
  return () => {
    window.removeEventListener(type, wrappedHandler, options)
  }
}

/**
 * Отправить событие с правильными типами
 * 
 * @example
 * dispatchAppEvent('levelUp', { newLevel: 5, previousLevel: 4, xp: 500 })
 */
export function dispatchAppEvent<K extends keyof AppEventMap>(
  type: K,
  detail: AppEventMap[K]['detail']
): void {
  const event = createCustomEvent(type, detail)
  window.dispatchEvent(event)
}
