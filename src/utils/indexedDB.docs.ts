/**
 * IndexedDB — Документация по использованию
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

/**
 * ## Быстрый старт
 * 
 * ### Импорт
 * ```typescript
 * import { useIndexedDB, useIndexedDBAll } from '@hooks/useIndexedDB'
 * import { add, get, put, remove, getAll } from '@utils/indexedDB'
 * ```
 * 
 * ### Хук для одной записи
 * ```typescript
 * const { data, loading, error, add, update, remove, refresh } = useIndexedDB<UserProgress>(
 *   'progress',
 *   'user-123'
 * )
 * ```
 * 
 * ### Хук для всех записей
 * ```typescript
 * const { data, loading, error, add, update, remove, clear, refresh } = useIndexedDBAll<TypingSession>(
 *   'sessions'
 * )
 * ```
 * 
 * ### Прямое использование
 * ```typescript
 * // Добавление
 * const id = await add('sessions', {
 *   id: 'session-1',
 *   date: Date.now(),
 *   wpm: 60,
 *   accuracy: 95,
 *   // ...
 * })
 * 
 * // Получение
 * const session = await get('sessions', 'session-1')
 * 
 * // Обновление
 * await put('sessions', { ...session, wpm: 70 })
 * 
 * // Удаление
 * await remove('sessions', 'session-1')
 * 
 * // Получение всех
 * const allSessions = await getAll('sessions')
 * ```
 * 
 * ## Структура базы данных
 * 
 * ### Хранилища
 * 
 * #### sessions
 * - `id: string` — уникальный идентификатор
 * - `date: number` — timestamp сессии
 * - `wpm: number` — скорость в словах в минуту
 * - `cpm: number` — скорость в знаках в минуту
 * - `accuracy: number` — точность в процентах
 * - `errors: number` — количество ошибок
 * - `correctChars: number` — правильные символы
 * - `totalChars: number` — всего символов
 * - `timeElapsed: number` — время в секундах
 * - `mode: string` — режим тренировки
 * 
 * #### settings
 * - `key: string` — ключ настройки
 * - `value: any` — значение настройки
 * - `updatedAt: number` — timestamp обновления
 * 
 * #### progress
 * - `userId: string` — идентификатор пользователя
 * - `xp: number` — опыт
 * - `level: number` — уровень
 * - `totalWordsTyped: number` — всего слов напечатано
 * - `bestWpm: number` — лучшая скорость
 * - `bestAccuracy: number` — лучшая точность
 * - `streak: number` — серия дней
 * - `updatedAt: number` — timestamp обновления
 * 
 * #### achievements
 * - `id: string` — уникальный идентификатор
 * - `unlockedAt: number` — timestamp получения
 * 
 * ## Индексы
 * 
 * ### sessions
 * - `date` — для фильтрации по дате
 * - `wpm` — для сортировки по скорости
 * - `mode` — для фильтрации по режиму
 * 
 * ### settings
 * - `updatedAt` — для сортировки по времени
 * 
 * ### achievements
 * - `unlockedAt` — для сортировки по времени получения
 * 
 * ## Миграция с LocalStorage
 * 
 * ```typescript
 * import { migrateFromLocalStorage } from '@utils/indexedDB'
 * 
 * // Миграция сессий
 * const migrated = await migrateFromLocalStorage(
 *   'typing-sessions',
 *   'sessions',
 *   (data) => ({
 *     ...data,
 *     id: data.sessionId,
 *   })
 * )
 * 
 * console.log(`Мигрировано записей: ${migrated}`)
 * ```
 * 
 * ## Обработка ошибок
 * 
 * ```typescript
 * try {
 *   const session = await get('sessions', 'session-1')
 * } catch (error) {
 *   console.error('Ошибка при получении сессии:', error)
 *   // Fallback на localStorage
 *   const fallback = localStorage.getItem('session-1')
 * }
 * ```
 * 
 * ## Проверка доступности
 * 
 * ```typescript
 * import { isIndexedDBAvailable } from '@utils/indexedDB'
 * 
 * if (isIndexedDBAvailable()) {
 *   // Используем IndexedDB
 * } else {
 *   // Fallback на localStorage
 * }
 * ```
 * 
 * ## Очистка базы
 * 
 * ```typescript
 * import { clear, deleteDB } from '@utils/indexedDB'
 * 
 * // Очистка хранилища
 * await clear('sessions')
 * 
 * // Удаление всей базы
 * await deleteDB()
 * ```
 * 
 * ## Производительность
 * 
 * - IndexedDB асинхронный, не блокирует UI
 * - Используйте индексы для частых запросов
 * - Кэшируйте результаты в состоянии компонента
 * - Избегайте частых операций записи
 * 
 * ## Безопасность
 * 
 * - IndexedDB доступен только в том же источнике (same-origin)
 * - Не храните чувствительные данные (пароли, токены)
 * - Данные зашифрованы только на уровне браузера
 */

export {}
