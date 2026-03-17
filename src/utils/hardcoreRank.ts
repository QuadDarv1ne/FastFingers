/**
 * Система рангов для режима "Без ошибок" (Hardcore Mode)
 * Ранг определяется по длине серии (streak)
 */

export type HardcoreRank = 'C' | 'B' | 'A' | 'S' | 'S+' | 'SS' | 'SS+' | '👑'

export interface RankInfo {
  rank: HardcoreRank
  name: string
  color: string
  minStreak: number
  maxStreak: number
  description: string
}

const RANKS: RankInfo[] = [
  {
    rank: 'C',
    name: 'Новичок',
    color: '#6b7280',
    minStreak: 0,
    maxStreak: 14,
    description: 'Первые шаги в режиме без ошибок',
  },
  {
    rank: 'B',
    name: 'Ученик',
    color: '#3b82f6',
    minStreak: 15,
    maxStreak: 29,
    description: 'Уже лучше! Продолжай практиковаться',
  },
  {
    rank: 'A',
    name: 'Продвинутый',
    color: '#22c55e',
    minStreak: 30,
    maxStreak: 49,
    description: 'Отличный результат! Ты на правильном пути',
  },
  {
    rank: 'S',
    name: 'Эксперт',
    color: '#f59e0b',
    minStreak: 50,
    maxStreak: 74,
    description: 'Впечатляет! Ты мастер точности',
  },
  {
    rank: 'S+',
    name: 'Мастер',
    color: '#ef4444',
    minStreak: 75,
    maxStreak: 99,
    description: 'Почти идеально! Ещё немного до легенды',
  },
  {
    rank: 'SS',
    name: 'Легенда',
    color: '#a855f7',
    minStreak: 100,
    maxStreak: 149,
    description: 'Невероятно! Ты среди лучших',
  },
  {
    rank: 'SS+',
    name: 'Мифический',
    color: '#ec4899',
    minStreak: 150,
    maxStreak: 199,
    description: 'Легендарная точность! Тебя запомнят',
  },
  {
    rank: '👑',
    name: 'Божественный',
    color: '#fbbf24',
    minStreak: 200,
    maxStreak: Infinity,
    description: 'Абсолютное совершенство! Ты непобедим',
  },
]

/**
 * Получить ранг по длине серии
 */
export function getRankByStreak(streak: number): RankInfo {
  // Last rank has Infinity as maxStreak, so this always finds a match
  for (const rank of RANKS) {
    if (streak >= rank.minStreak && streak <= rank.maxStreak) {
      return rank
    }
  }
  // Fallback (should never reach here due to Infinity in last rank)
  return RANKS[0]!
}

/**
 * Получить прогресс до следующего ранга (0-100%)
 */
export function getRankProgress(streak: number): number {
  const currentRank = getRankByStreak(streak)
  
  if (currentRank.rank === '👑') {
    return 100
  }
  
  const nextRank = RANKS.find(r => r.minStreak > currentRank.minStreak)
  if (!nextRank) return 100
  
  const range = nextRank.minStreak - currentRank.minStreak
  const progress = streak - currentRank.minStreak
  
  return Math.min(100, Math.round((progress / range) * 100))
}

/**
 * Получить все ранги для отображения в UI
 */
export function getAllRanks(): RankInfo[] {
  return RANKS
}

/**
 * Проверить, получен ли новый ранг
 */
export function checkRankUp(oldStreak: number, newStreak: number): boolean {
  if (newStreak <= oldStreak) return false
  const oldRank = getRankByStreak(oldStreak)
  const newRank = getRankByStreak(newStreak)
  return oldRank.rank !== newRank.rank
}

/**
 * Получить сообщение о получении нового ранга
 */
export function getRankUpMessage(rank: RankInfo): string {
  const messages: Record<HardcoreRank, string> = {
    'C': '🎯 Первый ранг получен! Продолжай в том же духе!',
    'B': '🔥 Отлично! Ты уже не новичок!',
    'A': '⭐ Впечатляющий прогресс! Так держать!',
    'S': '🚀 Ты настоящий эксперт! Гордимся тобой!',
    'S+': '💎 Мастер слова! Твои пальцы — оружие!',
    'SS': '🏆 ЛЕГЕНДА! Твоё имя войдёт в историю!',
    'SS+': '💫 МИФИЧЕСКИЙ РАНГ! Ты превосходишь всех!',
    '👑': '👑 БОЖЕСТВЕННЫЙ! Ты непобедим!',
  }
  return messages[rank.rank]
}
