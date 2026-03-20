/**
 * Web Workers — Документация по использованию
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

/**
 * ## Быстрый старт
 * 
 * ### Импорт
 * ```typescript
 * import { useStatsWorker } from '@hooks/useStatsWorker'
 * ```
 * 
 * ### Использование в компоненте
 * ```typescript
 * function StatisticsComponent({ sessions, keystrokes }) {
 *   const {
 *     isReady,
 *     isBusy,
 *     error,
 *     calculateRhythm,
 *     calculateFingerBalance,
 *     analyzeTimeOfDay,
 *   } = useStatsWorker()
 * 
 *   const handleAnalysis = async () => {
 *     if (!isReady || isBusy) return
 * 
 *     try {
 *       const [rhythm, balance, timeAnalysis] = await Promise.all([
 *         calculateRhythm(keystrokes),
 *         calculateFingerBalance(keystrokes),
 *         analyzeTimeOfDay(sessions),
 *       ])
 * 
 *       console.log('Rhythm:', rhythm)
 *       console.log('Balance:', balance)
 *       console.log('Time analysis:', timeAnalysis)
 *     } catch (error) {
 *       console.error('Analysis failed:', error)
 *     }
 *   }
 * 
 *   return (
 *     <div>
 *       <button onClick={handleAnalysis} disabled={!isReady || isBusy}>
 *         {isBusy ? 'Анализ...' : 'Анализировать'}
 *       </button>
 *       {error && <p className="error">{error}</p>}
 *     </div>
 *   )
 * }
 * ```
 * 
 * ## Доступные методы
 * 
 * ### calculateRhythm(keystrokes)
 * Расчёт равномерности печати (Rhythm Score).
 * 
 * ```typescript
 * const rhythm = await calculateRhythm(keystrokes)
 * // Возвращает: number (0-100)
 * ```
 * 
 * ### calculateFingerBalance(keystrokes)
 * Расчёт баланса между левой и правой руками.
 * 
 * ```typescript
 * const balance = await calculateFingerBalance(keystrokes)
 * // Возвращает: { left: number, right: number }
 * ```
 * 
 * ### calculateErrorRecovery(keystrokes)
 * Расчёт среднего времени исправления ошибки.
 * 
 * ```typescript
 * const recovery = await calculateErrorRecovery(keystrokes)
 * // Возвращает: number (мс)
 * ```
 * 
 * ### analyzeTimeOfDay(sessions)
 * Анализ производительности по времени суток.
 * 
 * ```typescript
 * const timeAnalysis = await analyzeTimeOfDay(sessions)
 * // Возвращает: TimeOfDayPerformance[]
 * // [
 * //   { timeOfDay: 'morning', sessions: 10, avgWpm: 45, avgAccuracy: 90 },
 * //   { timeOfDay: 'afternoon', sessions: 15, avgWpm: 50, avgAccuracy: 92 },
 * //   ...
 * // ]
 * ```
 * 
 * ### analyzeFunnel(sessions, thresholds?)
 * Анализ воронки конверсии по WPM.
 * 
 * ```typescript
 * const funnel = await analyzeFunnel(sessions, [20, 40, 60, 80])
 * // Возвращает: { stages: FunnelStage[], conversionRates: number[] }
 * ```
 * 
 * ### calculateCorrelationMatrix(sessions)
 * Расчёт матрицы корреляции между метриками.
 * 
 * ```typescript
 * const matrix = await calculateCorrelationMatrix(sessions)
 * // Возвращает: number[][] (4x4 матрица)
 * ```
 * 
 * ## Состояния
 * 
 * ### isReady
 * Воркер готов к работе.
 * 
 * ```typescript
 * if (!isReady) {
 *   return <Loading />
 * }
 * ```
 * 
 * ### isBusy
 * Воркер выполняет вычисление.
 * 
 * ```typescript
 * if (isBusy) {
 *   return <Spinner />
 * }
 * ```
 * 
 * ### error
 * Ошибка вычисления.
 * 
 * ```typescript
 * if (error) {
 *   return <Error message={error} />
 * }
 * ```
 * 
 * ## Параллельные вычисления
 * 
 * Воркер обрабатывает только одну задачу одновременно.
 * Для параллельных вычислений используйте Promise.all:
 * 
 * ```typescript
 * const [rhythm, balance, recovery] = await Promise.all([
 *   calculateRhythm(keystrokes),
 *   calculateFingerBalance(keystrokes),
 *   calculateErrorRecovery(keystrokes),
 * ])
 * ```
 * 
 * ## Обработка ошибок
 * 
 * ```typescript
 * try {
 *   const result = await calculateRhythm(keystrokes)
 * } catch (error) {
 *   if (error.message === 'Worker not ready') {
 *     // Воркер ещё не инициализирован
 *   } else if (error.message === 'Worker is busy') {
 *     // Воркер занят другой задачей
 *   } else if (error.message === 'Worker timeout') {
 *     // Превышено время ожидания (30 сек)
 *   } else {
 *     // Другая ошибка
 *   }
 * }
 * ```
 * 
 * ## Очистка
 * 
 * Воркер автоматически очищается при размонтировании компонента.
 * Для ручной очистки:
 * 
 * ```typescript
 * terminate()
 * ```
 * 
 * ## Производительность
 * 
 * ### Преимущества
 * - Не блокирует основной поток
 * - UI остаётся отзывчивым
 * - Подходит для больших объёмов данных
 * 
 * ### Ограничения
 * - Только одна задача одновременно
 * - Таймаут 30 секунд
 * - Сериализация данных (структурированное клонирование)
 * 
 * ### Рекомендации
 * - Используйте для вычислений с >1000 элементов
 * - Для простых вычислений используйте обычные функции
 * - Кэшируйте результаты при возможности
 * 
 * ## Примеры использования
 * 
 * ### StatisticsPage
 * ```typescript
 * function StatisticsPage() {
 *   const { sessions } = useTypingHistory()
 *   const { analyzeTimeOfDay, analyzeFunnel, isReady } = useStatsWorker()
 *   const [analysis, setAnalysis] = useState(null)
 * 
 *   useEffect(() => {
 *     if (isReady && sessions.length > 0) {
 *       analyzeTimeOfDay(sessions).then(setAnalysis)
 *     }
 *   }, [isReady, sessions])
 * 
 *   return <AnalysisChart data={analysis} />
 * }
 * ```
 * 
 * ### AdvancedAnalytics
 * ```typescript
 * function AdvancedAnalytics({ keystrokes }) {
 *   const { calculateRhythm, calculateFingerBalance } = useStatsWorker()
 *   const [metrics, setMetrics] = useState(null)
 * 
 *   useEffect(() => {
 *     Promise.all([
 *       calculateRhythm(keystrokes),
 *       calculateFingerBalance(keystrokes),
 *     ]).then(([rhythm, balance]) => {
 *       setMetrics({ rhythm, balance })
 *     })
 *   }, [keystrokes])
 * 
 *   return <MetricsDisplay metrics={metrics} />
 * }
 * ```
 * 
 * ## Fallback
 * 
 * Для браузеров без поддержки Web Workers:
 * 
 * ```typescript
 * import { calculateRhythm as calculateRhythmSync } from '@utils/stats'
 * 
 * function useStatsWithFallback() {
 *   const worker = useStatsWorker()
 *   const isSupported = typeof Worker !== 'undefined'
 * 
 *   const calculateRhythm = async (keystrokes) => {
 *     if (isSupported && worker.isReady) {
 *       return worker.calculateRhythm(keystrokes)
 *     }
 *     return calculateRhythmSync(keystrokes)
 *   }
 * 
 *   return { calculateRhythm }
 * }
 * ```
 */

export {}
