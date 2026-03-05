import { TypingStats, KeyHeatmapData } from '../types';

export type KeyHeatmap = KeyHeatmapData;

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
