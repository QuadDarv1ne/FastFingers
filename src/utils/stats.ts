import {
  TypingStats,
  KeyHeatmapData,
  KeystrokeData,
  WeeklyProgress,
  FunnelStage,
  TimeOfDayPerformance,
} from '../types'

export type KeyHeatmap = KeyHeatmapData

export function calculateStats(
  correctChars: number,
  totalChars: number,
  errors: number,
  timeElapsed: number
): TypingStats {
  const timeInMinutes = timeElapsed / 60;

  const cpm = timeInMinutes > 0 ? Math.round(correctChars / timeInMinutes) : 0;
  const wpm = timeInMinutes > 0 ? Math.round(correctChars / 5 / timeInMinutes) : 0;
  const accuracy = totalChars > 0
    ? Math.round((correctChars / totalChars) * 100)
    : 100;

  return {
    wpm,
    cpm,
    accuracy,
    errors,
    correctChars,
    totalChars,
    timeElapsed,
  };
}

export function formatNumber(num: number): string {
  return num.toLocaleString('ru-RU');
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return hours > 0
    ? `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Форматирование WPM для отображения
 * @param wpm - Слов в минуту
 * @returns Строковое представление WPM
 */
export function formatWPM(wpm: number): string {
  return wpm.toString();
}

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
  const XP_PER_10_SECONDS = 1;
  const XP_PERFECT_ACCURACY = 50;
  const XP_GREAT_ACCURACY = 30;
  const XP_GOOD_ACCURACY = 20;
  const XP_DECENT_ACCURACY = 10;
  const XP_HIGH_WPM = 50;
  const XP_MEDIUM_WPM = 30;
  const XP_LOW_WPM = 20;
  const PENALTY_PER_ERROR = 2;

  const ACCURACY_PERFECT = 95;
  const ACCURACY_GREAT = 90;
  const ACCURACY_GOOD = 85;
  const ACCURACY_DECENT = 80;
  const WPM_HIGH = 60;
  const WPM_MEDIUM = 40;
  const WPM_LOW = 20;

  let xp = Math.floor(stats.timeElapsed / 10) * XP_PER_10_SECONDS;

  if (stats.accuracy >= ACCURACY_PERFECT) xp += XP_PERFECT_ACCURACY;
  else if (stats.accuracy >= ACCURACY_GREAT) xp += XP_GREAT_ACCURACY;
  else if (stats.accuracy >= ACCURACY_GOOD) xp += XP_GOOD_ACCURACY;
  else if (stats.accuracy >= ACCURACY_DECENT) xp += XP_DECENT_ACCURACY;

  if (stats.wpm >= WPM_HIGH) xp += XP_HIGH_WPM;
  else if (stats.wpm >= WPM_MEDIUM) xp += XP_MEDIUM_WPM;
  else if (stats.wpm >= WPM_LOW) xp += XP_LOW_WPM;

  xp -= stats.errors * PENALTY_PER_ERROR;

  return Math.max(0, xp);
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
  if (keystrokes.length < 2) return 100;

  const intervals: number[] = [];
  for (let i = 1; i < keystrokes.length; i++) {
    const prev = keystrokes[i - 1];
    const curr = keystrokes[i];
    if (prev && curr) {
      intervals.push(curr.timestamp - prev.timestamp);
    }
  }

  if (intervals.length === 0) return 100;

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  if (avgInterval === 0) return 100;

  // Расчёт стандартного отклонения
  const variance = intervals.reduce((sum, interval) => {
    return sum + Math.pow(interval - avgInterval, 2);
  }, 0) / intervals.length;

  const stdDev = Math.sqrt(variance);
  // Коэффициент вариации (CV)
  const cv = stdDev / avgInterval;

  // Преобразование CV в score (0-100)
  // CV = 0 -> Score = 100 (идеально равномерно)
  // CV >= 1 -> Score = 0 (очень неравномерно)
  const score = Math.max(0, Math.min(100, (1 - cv) * 100));

  return Math.round(score);
}

/**
 * Расчёт Finger Balance - баланса между руками
 * @param keystrokes - Массив данных о нажатиях клавиш
 * @returns Объект с процентом нажатий левой и правой руки
 */
export function calculateFingerBalance(keystrokes: KeystrokeData[]): { left: number; right: number } {
  if (keystrokes.length === 0) return { left: 50, right: 50 };

  let leftCount = 0;
  let rightCount = 0;

  keystrokes.forEach(keystroke => {
    if (keystroke.hand === 'left') leftCount++;
    else rightCount++;
  });

  const total = leftCount + rightCount;
  return {
    left: Math.round((leftCount / total) * 100),
    right: Math.round((rightCount / total) * 100),
  };
}

/**
 * Расчёт Error Recovery Time - времени исправления ошибки
 * @param keystrokes - Массив данных о нажатиях клавиш
 * @returns Среднее время исправления ошибки в мс
 */
export function calculateErrorRecoveryTime(keystrokes: KeystrokeData[]): number {
  const errorIndices = keystrokes
    .map((k, i) => (!k.isCorrect ? i : -1))
    .filter((i): i is number => i !== -1);

  if (errorIndices.length === 0) return 0;

  const recoveryTimes: number[] = [];

  errorIndices.forEach(errorIndex => {
    // Находим следующее правильное нажатие после ошибки
    for (let i = errorIndex + 1; i < keystrokes.length; i++) {
      const curr = keystrokes[i];
      const error = keystrokes[errorIndex];
      if (curr && curr.isCorrect && error) {
        recoveryTimes.push(curr.timestamp - error.timestamp);
        break;
      }
    }
  });

  if (recoveryTimes.length === 0) return 0;

  const avgRecoveryTime = recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length;
  return Math.round(avgRecoveryTime);
}

/**
 * Расчёт Session Efficiency - общей эффективности сессии
 * @param stats - Статистика сессии
 * @returns Session Efficiency (правильные символы / время) × точность
 */
export function calculateSessionEfficiency(stats: TypingStats): number {
  if (stats.timeElapsed === 0) return 0;

  const charsPerSecond = stats.correctChars / stats.timeElapsed;
  const efficiency = charsPerSecond * (stats.accuracy / 100);

  return Math.round(efficiency * 100) / 100;
}

/**
 * Расчёт Learning Velocity - прироста WPM за неделю
 * @param weeklyData - Массив данных о недельном прогрессе
 * @returns Прирост WPM за неделю (может быть отрицательным)
 */
export function calculateLearningVelocity(weeklyData: WeeklyProgress[]): number {
  if (weeklyData.length < 2) return 0;

  // Берём последние две недели
  const lastWeek = weeklyData[weeklyData.length - 1];
  const prevWeek = weeklyData[weeklyData.length - 2];

  if (!lastWeek || !prevWeek) return 0;

  return Math.round(lastWeek.avgWpm - prevWeek.avgWpm);
}

/**
 * Анализ времени суток для корреляционной матрицы
 * @param sessions - Массив сессий с временными метками
 * @returns Данные о производительности по времени суток
 */
export function analyzeTimeOfDayPerformance(
  sessions: (TypingStats & { timestamp: string })[]
): TimeOfDayPerformance[] {
  const timeSlots: Record<TimeOfDayPerformance['timeOfDay'], { wpm: number; accuracy: number; count: number }[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  };

  sessions.forEach(session => {
    const hour = new Date(session.timestamp).getHours();
    let timeOfDay: keyof typeof timeSlots;

    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    const slot = timeSlots[timeOfDay];
    if (slot) {
      slot.push({
        wpm: session.wpm,
        accuracy: session.accuracy,
        count: 1,
      });
    }
  });

  const result: TimeOfDayPerformance[] = [];

  (Object.keys(timeSlots) as Array<keyof typeof timeSlots>).forEach(timeOfDay => {
    const data = timeSlots[timeOfDay];
    if (!data || data.length === 0) {
      result.push({ timeOfDay, avgWpm: 0, avgAccuracy: 0, sessions: 0 });
      return;
    }

    const avgWpm = data.reduce((sum, d) => sum + d.wpm, 0) / data.length;
    const avgAccuracy = data.reduce((sum, d) => sum + d.accuracy, 0) / data.length;

    result.push({
      timeOfDay,
      avgWpm: Math.round(avgWpm),
      avgAccuracy: Math.round(avgAccuracy),
      sessions: data.length,
    });
  });

  return result;
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
    started: number;
    completed50: number;
    completed80: number;
    completed100: number;
    highAccuracy: number;
  }
): FunnelStage[] {
  const total = sessions.length;
  if (total === 0) return [];

  const completed50 = sessions.filter(s => s.timeElapsed >= thresholds.completed50).length;
  const completed80 = sessions.filter(s => s.timeElapsed >= thresholds.completed80).length;
  const completed100 = sessions.filter(s => s.timeElapsed >= thresholds.completed100).length;
  const highAccuracy = sessions.filter(s => s.accuracy >= thresholds.highAccuracy).length;

  return [
    { stage: 'Начали тренировку', count: total, percentage: 100 },
    { stage: '50% сессии', count: completed50, percentage: Math.round((completed50 / total) * 100) },
    { stage: '80% сессии', count: completed80, percentage: Math.round((completed80 / total) * 100) },
    { stage: '100% сессии', count: completed100, percentage: Math.round((completed100 / total) * 100) },
    { stage: 'Высокая точность', count: highAccuracy, percentage: Math.round((highAccuracy / total) * 100) },
  ];
}

/**
 * Прогноз достижения цели на основе текущей прогрессии
 * @param currentWpm - Текущий WPM
 * @param targetWpm - Целевой WPM
 * @param learningVelocity - Прирост WPM за неделю
 * @returns Прогнозируемое количество недель до достижения цели
 */
export function predictGoalAchievement(
  currentWpm: number,
  targetWpm: number,
  learningVelocity: number
): { weeks: number; achievable: boolean; projectedDate: string } {
  if (currentWpm >= targetWpm) {
    return { weeks: 0, achievable: true, projectedDate: new Date().toISOString() };
  }

  if (learningVelocity <= 0) {
    return { weeks: Infinity, achievable: false, projectedDate: '' };
  }

  const weeksNeeded = (targetWpm - currentWpm) / learningVelocity;
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + Math.round(weeksNeeded * 7));

  return {
    weeks: Math.round(weeksNeeded * 10) / 10,
    achievable: true,
    projectedDate: projectedDate.toISOString(),
  };
}

/**
 * Расчёт данных для Spider Chart (профиль навыков)
 * @param stats - Статистика сессии
 * @param keystrokes - Данные о нажатиях
 * @returns Объект с категориями для spider chart
 */
export function calculateSkillProfile(
  stats: TypingStats,
  keystrokes: KeystrokeData[]
): Record<string, number> {
  const rhythmScore = calculateRhythmScore(keystrokes);
  const efficiency = calculateSessionEfficiency(stats);
  const maxEfficiency = 10; // Нормализация (примерное максимальное значение)

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
  };
}
