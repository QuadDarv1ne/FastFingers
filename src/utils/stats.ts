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

export function calculateStats(
  correctChars: number,
  totalChars: number,
  errors: number,
  timeElapsed: number
): TypingStats {
  const timeInMinutes = timeElapsed / 60

  const cpm = timeInMinutes > 0 ? Math.round(correctChars / timeInMinutes) : 0
  const wpm = timeInMinutes > 0 ? Math.round(correctChars / 5 / timeInMinutes) : 0
  const accuracy = totalChars > 0
    ? Math.round((correctChars / totalChars) * 100)
    : 100

  return {
    wpm,
    cpm,
    accuracy,
    errors,
    correctChars,
    totalChars,
    timeElapsed,
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

export function checkAchievement(
  achievementId: string,
  progress: { bestWpm: number; bestAccuracy: number; totalWordsTyped: number },
  stats: TypingStats
): boolean {
  const achievements: Record<string, (p: typeof progress, s: TypingStats) => boolean> = {
    'first-steps': () => stats.wpm >= 10,
    'speed-demon': (p) => p.bestWpm >= 40,
    'accuracy-master': (p) => p.bestAccuracy >= 95,
    'word-warrior': (p) => p.totalWordsTyped >= 1000,
    'perfectionist': () => stats.accuracy === 100 && stats.wpm >= 30,
    'marathon': (p) => p.totalWordsTyped >= 10000,
  };

  return achievements[achievementId]?.(progress, stats) ?? false;
}

export function updateKeyHeatmap(
  heatmap: KeyHeatmap,
  key: string,
  isCorrect: boolean
): KeyHeatmap {
  if (!heatmap[key]) {
    heatmap[key] = { errors: 0, total: 0, accuracy: 100 };
  }

  heatmap[key].total++;
  if (!isCorrect) {
    heatmap[key].errors++;
  }
  heatmap[key].accuracy = Math.round(
    ((heatmap[key].total - heatmap[key].errors) / heatmap[key].total) * 100
  );

  return heatmap;
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

  let sum = 0
  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i]
    if (interval !== undefined) sum += interval
  }
  const avgInterval = sum / intervals.length
  if (avgInterval === 0) return 100

  let varianceSum = 0
  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i]
    if (interval !== undefined) {
      varianceSum += Math.pow(interval - avgInterval, 2)
    }
  }
  const variance = varianceSum / intervals.length

  const stdDev = Math.sqrt(variance)
  const cv = stdDev / avgInterval
  const score = Math.max(0, Math.min(100, (1 - cv) * 100))

  return Math.round(score)
}

export function calculateFingerBalance(keystrokes: KeystrokeData[]): { left: number; right: number } {
  if (keystrokes.length === 0) return { left: 50, right: 50 }

  let leftCount = 0
  let rightCount = 0

  for (let i = 0; i < keystrokes.length; i++) {
    const keystroke = keystrokes[i]
    if (keystroke && keystroke.hand === 'left') leftCount++
    else rightCount++
  }

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
  const errorIndices: number[] = []
  for (let i = 0; i < keystrokes.length; i++) {
    const keystroke = keystrokes[i]
    if (keystroke && !keystroke.isCorrect) errorIndices.push(i)
  }

  if (errorIndices.length === 0) return 0

  const recoveryTimes: number[] = []

  for (let i = 0; i < errorIndices.length; i++) {
    const errorIndex = errorIndices[i]
    if (errorIndex === undefined) continue
    for (let j = errorIndex + 1; j < keystrokes.length; j++) {
      const curr = keystrokes[j]
      const error = keystrokes[errorIndex]
      if (curr && curr.isCorrect && error) {
        recoveryTimes.push(curr.timestamp - error.timestamp)
        break
      }
    }
  }

  if (recoveryTimes.length === 0) return 0

  let sum = 0
  for (let i = 0; i < recoveryTimes.length; i++) {
    const time = recoveryTimes[i]
    if (time !== undefined) sum += time
  }
  const avgRecoveryTime = sum / recoveryTimes.length
  return Math.round(avgRecoveryTime)
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
  const morningData: { wpm: number; accuracy: number }[] = []
  const afternoonData: { wpm: number; accuracy: number }[] = []
  const eveningData: { wpm: number; accuracy: number }[] = []
  const nightData: { wpm: number; accuracy: number }[] = []

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i]
    if (!session) continue

    const hour = new Date(session.timestamp).getHours()
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'

    if (hour >= 5 && hour < 12) timeOfDay = 'morning'
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon'
    else if (hour >= 17 && hour < 22) timeOfDay = 'evening'
    else timeOfDay = 'night'

    const data = { wpm: session.wpm, accuracy: session.accuracy }
    if (timeOfDay === 'morning') morningData.push(data)
    else if (timeOfDay === 'afternoon') afternoonData.push(data)
    else if (timeOfDay === 'evening') eveningData.push(data)
    else nightData.push(data)
  }

  const calcAvg = (data: { wpm: number; accuracy: number }[]) => {
    if (data.length === 0) return { avgWpm: 0, avgAccuracy: 0 }
    let wpmSum = 0
    let accSum = 0
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      if (item) {
        wpmSum += item.wpm
        accSum += item.accuracy
      }
    }
    return {
      avgWpm: Math.round(wpmSum / data.length),
      avgAccuracy: Math.round(accSum / data.length),
    }
  }

  const morning = calcAvg(morningData)
  const afternoon = calcAvg(afternoonData)
  const evening = calcAvg(eveningData)
  const night = calcAvg(nightData)

  return [
    { timeOfDay: 'morning', avgWpm: morning.avgWpm, avgAccuracy: morning.avgAccuracy, sessions: morningData.length },
    { timeOfDay: 'afternoon', avgWpm: afternoon.avgWpm, avgAccuracy: afternoon.avgAccuracy, sessions: afternoonData.length },
    { timeOfDay: 'evening', avgWpm: evening.avgWpm, avgAccuracy: evening.avgAccuracy, sessions: eveningData.length },
    { timeOfDay: 'night', avgWpm: night.avgWpm, avgAccuracy: night.avgAccuracy, sessions: nightData.length },
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

  let completed50 = 0
  let completed80 = 0
  let completed100 = 0
  let highAccuracy = 0

  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i]
    if (!s) continue
    if (s.timeElapsed >= thresholds.completed50) completed50++
    if (s.timeElapsed >= thresholds.completed80) completed80++
    if (s.timeElapsed >= thresholds.completed100) completed100++
    if (s.accuracy >= thresholds.highAccuracy) highAccuracy++
  }

  return [
    { stage: 'Начали тренировку', count: total, percentage: 100 },
    { stage: '50% сессии', count: completed50, percentage: Math.round((completed50 / total) * 100) },
    { stage: '80% сессии', count: completed80, percentage: Math.round((completed80 / total) * 100) },
    { stage: '100% сессии', count: completed100, percentage: Math.round((completed100 / total) * 100) },
    { stage: 'Высокая точность', count: highAccuracy, percentage: Math.round((highAccuracy / total) * 100) },
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
