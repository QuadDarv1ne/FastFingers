import { TypingStats, KeyHeatmapData } from '../types';

// Расчёт статистики печати
export function calculateStats(
  correctChars: number,
  totalChars: number,
  errors: number,
  timeElapsed: number // в секундах
): TypingStats {
  const timeInMinutes = timeElapsed / 60;
  
  // CPM - символов в минуту
  const cpm = timeInMinutes > 0 ? Math.round(correctChars / timeInMinutes) : 0;
  
  // WPM - слов в минуту (среднее слово = 5 символов)
  const wpm = timeInMinutes > 0 ? Math.round(correctChars / 5 / timeInMinutes) : 0;
  
  // Точность в процентах
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

// Форматирование времени (секунды -> ММ:СС)
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Форматирование WPM для отображения
export function formatWPM(wpm: number): string {
  return wpm.toString();
}

// Расчёт уровня пользователя на основе XP
export function calculateLevel(xp: number): number {
  // Формула: уровень = floor(sqrt(xp / 100))
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// Расчёт необходимого XP для следующего уровня
export function xpForLevel(level: number): number {
  return Math.pow(level, 2) * 100;
}

// Расчёт прогресса до следующего уровня (0-100%)
export function calculateLevelProgress(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const prevLevelXp = xpForLevel(currentLevel - 1);
  const nextLevelXp = xpForLevel(currentLevel);
  const progress = ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;
  return Math.min(100, Math.max(0, progress));
}

// Расчёт XP за сессию
export function calculateSessionXp(stats: TypingStats): number {
  let xp = 0;
  
  // Базовый XP за время (1 XP за каждые 10 секунд)
  xp += Math.floor(stats.timeElapsed / 10);
  
  // Бонус за точность
  if (stats.accuracy >= 95) xp += 50;
  else if (stats.accuracy >= 90) xp += 30;
  else if (stats.accuracy >= 85) xp += 20;
  else if (stats.accuracy >= 80) xp += 10;
  
  // Бонус за WPM
  if (stats.wpm >= 60) xp += 50;
  else if (stats.wpm >= 40) xp += 30;
  else if (stats.wpm >= 20) xp += 20;
  
  // Штраф за ошибки
  xp -= stats.errors * 2;
  
  return Math.max(0, xp);
}

// Проверка достижения
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

  const achievement = achievements[achievementId];
  return achievement ? achievement(progress, stats) : false;
}

// Тепловая карта ошибок по клавишам
export type KeyHeatmap = KeyHeatmapData;

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

// Получение цвета для тепловой карты (от зелёного к красному)
export function getHeatmapColor(accuracy: number): string {
  if (accuracy >= 95) return '#22c55e'; // зелёный
  if (accuracy >= 85) return '#84cc16'; // светло-зелёный
  if (accuracy >= 75) return '#eab308'; // жёлтый
  if (accuracy >= 60) return '#f97316'; // оранжевый
  return '#ef4444'; // красный
}
