import {
  TypingStats,
  KeyHeatmapData,
  KeystrokeData,
  WeeklyProgress,
  FunnelStage,
  TimeOfDayPerformance,
} from '../types'
import { formatNumber, formatDuration } from './number'

export type KeyHeatmap = KeyHeatmapData

// Экспорт для обратной совместимости
export { formatNumber, formatDuration as formatTime }

// Константы для calculateSessionXp
const XP_PER_10_SECONDS = 1
const XP_PERFECT_ACCURACY = 50
const XP_GREAT_ACCURACY = 30
const XP_GOOD_ACCURACY = 20
const XP_DECENT_ACCURACY = 10
const XP_HIGH_WPM = 50
const XP_MEDIUM_WPM = 30
const XP_LOW_WPM = 20
const PENALTY_PER_ERROR = 2

const ACCURACY_PERFECT = 95
const ACCURACY_GREAT = 90
const ACCURACY_GOOD = 85
const ACCURACY_DECENT = 80
const WPM_HIGH = 60
const WPM_MEDIUM = 40
const WPM_LOW = 20

/**
 * Расчёт статистики печати с защитой от некорректных значений
 */
export function calculateStats(
  correctChars: number,
  totalChars: number,
  errors: number,
  timeElapsed: number
): TypingStats {
  // Валидация входных параметров
  const safeCorrectChars = Math.max(0, Math.floor(correctChars) || 0)
  const safeTotalChars = Math.max(1, Math.floor(totalChars) || 1) // Защита от деления на ноль
  const safeErrors = Math.max(0, Math.floor(errors) || 0)
  const safeTimeElapsed = Math.max(0.001, timeElapsed || 0.001) // Минимальное время для расчёта

  const timeInMinutes = safeTimeElapsed / 60

  const cpm = timeInMinutes > 0 ? Math.round(safeCorrectChars / timeInMinutes) : 0
  const wpm = timeInMinutes > 0 ? Math.round(safeCorrectChars / 5 / timeInMinutes) : 0
  const accuracy = safeTotalChars > 0
    ? Math.min(100, Math.max(0, Math.round((safeCorrectChars / safeTotalChars) * 100)))
    : 100

  return {
    wpm,
    cpm,
    accuracy,
    errors: safeErrors,
    correctChars: safeCorrectChars,
    totalChars: safeTotalChars,
    timeElapsed: safeTimeElapsed,
  }
}

/**
 * Форматирование WPM для отображения
 */
export const formatWPM = (wpm: number): string => wpm.toString()

/**
 * Расчёт уровня пользователя на основе XP
 * @param xp - Текущий опыт пользователя
 * @returns Номер уровня (начиная с 1)
 */
export function calculateLevel(xp: number): number {
  // Формула: уровень = floor(sqrt(xp / 100))
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Расчёт необходимого XP для следующего уровня
 * @param level - Номер уровня
 * @returns Количество XP, необходимое для достижения уровня
 */
export function xpForLevel(level: number): number {
  return Math.pow(level, 2) * 100;
}

/**
 * Расчёт прогресса до следующего уровня (0-100%)
 * @param xp - Текущий опыт пользователя
 * @returns Процент прогресса (0-100)
 */
export function calculateLevelProgress(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const prevLevelXp = xpForLevel(currentLevel - 1);
  const nextLevelXp = xpForLevel(currentLevel);
  const progress = ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;
  return Math.min(100, Math.max(0, progress));
}

export function calculateSessionXp(stats: TypingStats): number {
  let xp = Math.floor(stats.timeElapsed / 10) * XP_PER_10_SECONDS

  if (stats.accuracy >= ACCURACY_PERFECT) xp += XP_PERFECT_ACCURACY
  else if (stats.accuracy >= ACCURACY_GREAT) xp += XP_GREAT_ACCURACY
  else if (stats.accuracy >= ACCURACY_GOOD) xp += XP_GOOD_ACCURACY
  else if (stats.accuracy >= ACCURACY_DECENT) xp += XP_DECENT_ACCURACY

  if (stats.wpm >= WPM_HIGH) xp += XP_HIGH_WPM
  else if (stats.wpm >= WPM_MEDIUM) xp += XP_MEDIUM_WPM
  else if (stats.wpm >= WPM_LOW) xp += XP_LOW_WPM

  xp -= stats.errors * PENALTY_PER_ERROR

  return Math.max(0, xp)
}

const ACHIEVEMENT_CHECKS: Record<string, (p: { bestWpm: number; bestAccuracy: number; totalWordsTyped: number }, s: TypingStats) => boolean> = {
  'first-steps': (_, s) => s.wpm >= 10,
  'speed-demon': (p) => p.bestWpm >= 40,
  'accuracy-master': (p) => p.bestAccuracy >= 95,
  'word-warrior': (p) => p.totalWordsTyped >= 1000,
  'perfectionist': (_, s) => s.accuracy === 100 && s.wpm >= 30,
  'marathon': (p) => p.totalWordsTyped >= 10000,
}

export function checkAchievement(
  achievementId: string,
  progress: { bestWpm: number; bestAccuracy: number; totalWordsTyped: number },
  stats: TypingStats
): boolean {
  return ACHIEVEMENT_CHECKS[achievementId]?.(progress, stats) ?? false
}

export function updateKeyHeatmap(
  heatmap: KeyHeatmap,
  key: string,
  isCorrect: boolean
): KeyHeatmap {
  const existing = heatmap[key]
  const total = (existing?.total ?? 0) + 1
  const errors = (existing?.errors ?? 0) + (isCorrect ? 0 : 1)
  const accuracy = Math.round(((total - errors) / total) * 100)

  return {
    ...heatmap,
    [key]: { errors, total, accuracy },
  }
}

export function getHeatmapColor(accuracy: number): string {
  if (accuracy >= 95) return '#22c55e';
  if (accuracy >= 85) return '#84cc16';
  if (accuracy >= 75) return '#eab308';
  if (accuracy >= 60) return '#f97316';
  return '#ef4444';
}

export function calculateStreak(dates: number[]): number {
  if (dates.length === 0) return 0;

  const uniqueDates = [...new Set(dates.map(d => new Date(d).toDateString()))];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  const hasToday = uniqueDates.some(d => new Date(d).toDateString() === today.toDateString());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const hasYesterday = uniqueDates.some(d => new Date(d).toDateString() === yesterday.toDateString());

  if (!hasToday && !hasYesterday) return 0;

  while (true) {
    const dateStr = currentDate.toDateString();
    const hasActivity = uniqueDates.some(d => new Date(d).toDateString() === dateStr);

    if (!hasActivity) break;

    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

export function calculateStreakBonus(streak: number): number {
  if (streak < 3) return 1.0;
  if (streak < 7) return 1.1;
  if (streak < 14) return 1.25;
  if (streak < 30) return 1.5;
  return 2.0;
}

/**
 * Расчёт Rhythm Score - равномерности печати
 * @param keystrokes - Массив данных о нажатиях клавиш
 * @returns Rhythm Score от 0 до 100 (чем выше, тем равномернее)
 */
export function calculateRhythmScore(keystrokes: KeystrokeData[]): number {
  if (keystrokes.length < 2) return 100

  const intervals: number[] = []
  for (let i = 1; i < keystrokes.length; i++) {
    const prev = keystrokes[i - 1]
    const curr = keystrokes[i]
    if (prev && curr) {
      intervals.push(curr.timestamp - prev.timestamp)
    }
  }

  if (intervals.length === 0) return 100

  const sum = intervals.reduce((acc, v) => acc + v, 0)
  const avgInterval = sum / intervals.length
  if (avgInterval === 0) return 100

  const varianceSum = intervals.reduce((acc, v) => acc + Math.pow(v - avgInterval, 2), 0)
  const variance = varianceSum / intervals.length

  const stdDev = Math.sqrt(variance)
  const cv = stdDev / avgInterval
  const score = Math.max(0, Math.min(100, (1 - cv) * 100))

  return Math.round(score)
}

export function calculateFingerBalance(keystrokes: KeystrokeData[]): { left: number; right: number } {
  if (keystrokes.length === 0) return { left: 50, right: 50 }

  const leftCount = keystrokes.filter(k => k?.hand === 'left').length
  const rightCount = keystrokes.length - leftCount
  const total = leftCount + rightCount

  return {
    left: Math.round((leftCount / total) * 100),
    right: Math.round((rightCount / total) * 100),
  }
}

/**
 * Расчёт Error Recovery Time - времени исправления ошибки
 * @param keystrokes - Массив данных о нажатиях клавиш
 * @returns Среднее время исправления ошибки в мс
 */
export function calculateErrorRecoveryTime(keystrokes: KeystrokeData[]): number {
  const errorIndices = keystrokes
    .map((k, i) => (k && !k.isCorrect ? i : -1))
    .filter(i => i !== -1)

  if (errorIndices.length === 0) return 0

  const recoveryTimes: number[] = []

  for (const errorIndex of errorIndices) {
    const error = keystrokes[errorIndex]
    if (!error) continue

    for (let j = errorIndex + 1; j < keystrokes.length; j++) {
      const curr = keystrokes[j]
      if (curr && curr.isCorrect) {
        recoveryTimes.push(curr.timestamp - error.timestamp)
        break
      }
    }
  }

  if (recoveryTimes.length === 0) return 0

  const sum = recoveryTimes.reduce((acc, v) => acc + v, 0)
  return Math.round(sum / recoveryTimes.length)
}

export function calculateSessionEfficiency(stats: TypingStats): number {
  if (stats.timeElapsed === 0) return 0

  const charsPerSecond = stats.correctChars / stats.timeElapsed
  const efficiency = charsPerSecond * (stats.accuracy / 100)

  return Math.round(efficiency * 100) / 100
}

/**
 * Расчёт Learning Velocity - прироста WPM за неделю
 * @param weeklyData - Массив данных о недельном прогрессе
 * @returns Прирост WPM за неделю (может быть отрицательным)
 */
export function calculateLearningVelocity(weeklyData: WeeklyProgress[]): number {
  if (weeklyData.length < 2) return 0

  const lastWeek = weeklyData[weeklyData.length - 1]
  const prevWeek = weeklyData[weeklyData.length - 2]

  if (!lastWeek || !prevWeek) return 0

  return Math.round(lastWeek.avgWpm - prevWeek.avgWpm)
}

export function analyzeTimeOfDayPerformance(
  sessions: (TypingStats & { timestamp: string })[]
): TimeOfDayPerformance[] {
  const morning: { wpm: number; accuracy: number }[] = []
  const afternoon: { wpm: number; accuracy: number }[] = []
  const evening: { wpm: number; accuracy: number }[] = []
  const night: { wpm: number; accuracy: number }[] = []

  for (const session of sessions) {
    if (!session) continue

    const hour = new Date(session.timestamp).getHours()

    if (hour >= 5 && hour < 12) morning.push({ wpm: session.wpm, accuracy: session.accuracy })
    else if (hour >= 12 && hour < 17) afternoon.push({ wpm: session.wpm, accuracy: session.accuracy })
    else if (hour >= 17 && hour < 22) evening.push({ wpm: session.wpm, accuracy: session.accuracy })
    else night.push({ wpm: session.wpm, accuracy: session.accuracy })
  }

  const calcAvg = (data: { wpm: number; accuracy: number }[]): { avgWpm: number; avgAccuracy: number } => {
    if (data.length === 0) return { avgWpm: 0, avgAccuracy: 0 }
    const wpmSum = data.reduce((acc, v) => acc + v.wpm, 0)
    const accSum = data.reduce((acc, v) => acc + v.accuracy, 0)
    return {
      avgWpm: Math.round(wpmSum / data.length),
      avgAccuracy: Math.round(accSum / data.length),
    }
  }

  return [
    { timeOfDay: 'morning', ...calcAvg(morning), sessions: morning.length },
    { timeOfDay: 'afternoon', ...calcAvg(afternoon), sessions: afternoon.length },
    { timeOfDay: 'evening', ...calcAvg(evening), sessions: evening.length },
    { timeOfDay: 'night', ...calcAvg(night), sessions: night.length },
  ]
}

/**
 * Анализ оттока пользователей (Funnel Analysis)
 * @param sessions - Массив сессий
 * @param thresholds - Пороговые значения для каждого этапа
 * @returns Данные воронки
 */
export function analyzeFunnel(
  sessions: (TypingStats & { timestamp: string })[],
  thresholds: {
    started: number
    completed50: number
    completed80: number
    completed100: number
    highAccuracy: number
  }
): FunnelStage[] {
  const total = sessions.length
  if (total === 0) return []

  const counts = sessions.reduce(
    (acc, s) => {
      if (!s) return acc
      return {
        completed50: acc.completed50 + (s.timeElapsed >= thresholds.completed50 ? 1 : 0),
        completed80: acc.completed80 + (s.timeElapsed >= thresholds.completed80 ? 1 : 0),
        completed100: acc.completed100 + (s.timeElapsed >= thresholds.completed100 ? 1 : 0),
        highAccuracy: acc.highAccuracy + (s.accuracy >= thresholds.highAccuracy ? 1 : 0),
      }
    },
    { completed50: 0, completed80: 0, completed100: 0, highAccuracy: 0 }
  )

  return [
    { stage: 'Начали тренировку', count: total, percentage: 100 },
    { stage: '50% сессии', count: counts.completed50, percentage: Math.round((counts.completed50 / total) * 100) },
    { stage: '80% сессии', count: counts.completed80, percentage: Math.round((counts.completed80 / total) * 100) },
    { stage: '100% сессии', count: counts.completed100, percentage: Math.round((counts.completed100 / total) * 100) },
    { stage: 'Высокая точность', count: counts.highAccuracy, percentage: Math.round((counts.highAccuracy / total) * 100) },
  ]
}

export function predictGoalAchievement(
  currentWpm: number,
  targetWpm: number,
  learningVelocity: number
): { weeks: number; achievable: boolean; projectedDate: string } {
  if (currentWpm >= targetWpm) {
    return { weeks: 0, achievable: true, projectedDate: new Date().toISOString() }
  }

  if (learningVelocity <= 0) {
    return { weeks: Infinity, achievable: false, projectedDate: '' }
  }

  const weeksNeeded = (targetWpm - currentWpm) / learningVelocity
  const projectedDate = new Date()
  projectedDate.setDate(projectedDate.getDate() + Math.round(weeksNeeded * 7))

  return {
    weeks: Math.round(weeksNeeded * 10) / 10,
    achievable: true,
    projectedDate: projectedDate.toISOString(),
  }
}

export function calculateSkillProfile(
  stats: TypingStats,
  keystrokes: KeystrokeData[]
): Record<string, number> {
  const rhythmScore = calculateRhythmScore(keystrokes)
  const efficiency = calculateSessionEfficiency(stats)
  const maxEfficiency = 10

  return {
    'Скорость (WPM)': Math.min(100, (stats.wpm / 100) * 100),
    'Точность': stats.accuracy,
    'Ритм': rhythmScore,
    'Эффективность': Math.min(100, (efficiency / maxEfficiency) * 100),
    'Баланс рук': keystrokes.length > 0
      ? 100 - Math.abs(50 - calculateFingerBalance(keystrokes).left)
      : 50,
    'Реакция': keystrokes.length > 0
      ? Math.max(0, 100 - calculateErrorRecoveryTime(keystrokes) / 10)
      : 50,
  }
}
