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
    name: 'hardcore.rank.C.name',
    color: '#6b7280',
    minStreak: 0,
    maxStreak: 14,
    description: 'hardcore.rank.C.desc',
  },
  {
    rank: 'B',
    name: 'hardcore.rank.B.name',
    color: '#3b82f6',
    minStreak: 15,
    maxStreak: 29,
    description: 'hardcore.rank.B.desc',
  },
  {
    rank: 'A',
    name: 'hardcore.rank.A.name',
    color: '#22c55e',
    minStreak: 30,
    maxStreak: 49,
    description: 'hardcore.rank.A.desc',
  },
  {
    rank: 'S',
    name: 'hardcore.rank.S.name',
    color: '#f59e0b',
    minStreak: 50,
    maxStreak: 74,
    description: 'hardcore.rank.S.desc',
  },
  {
    rank: 'S+',
    name: 'hardcore.rank.S+.name',
    color: '#ef4444',
    minStreak: 75,
    maxStreak: 99,
    description: 'hardcore.rank.S+.desc',
  },
  {
    rank: 'SS',
    name: 'hardcore.rank.SS.name',
    color: '#a855f7',
    minStreak: 100,
    maxStreak: 149,
    description: 'hardcore.rank.SS.desc',
  },
  {
    rank: 'SS+',
    name: 'hardcore.rank.SS+.name',
    color: '#ec4899',
    minStreak: 150,
    maxStreak: 199,
    description: 'hardcore.rank.SS+.desc',
  },
  {
    rank: '👑',
    name: 'hardcore.rank.crown.name',
    color: '#fbbf24',
    minStreak: 200,
    maxStreak: Infinity,
    description: 'hardcore.rank.crown.desc',
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
  return (RANKS[0] ?? RANKS[RANKS.length - 1]) as RankInfo
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
    'C': 'hardcore.rankUp.C',
    'B': 'hardcore.rankUp.B',
    'A': 'hardcore.rankUp.A',
    'S': 'hardcore.rankUp.S',
    'S+': 'hardcore.rankUp.S+',
    'SS': 'hardcore.rankUp.SS',
    'SS+': 'hardcore.rankUp.SS+',
    '👑': 'hardcore.rankUp.crown',
  }
  return messages[rank.rank]
}
