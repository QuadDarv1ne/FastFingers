import { describe, it, expect } from 'vitest'
import {
  calculateStats,
  calculateLevel,
  xpForLevel,
  calculateLevelProgress,
  calculateSessionXp,
  checkAchievement,
  updateKeyHeatmap,
  getHeatmapColor,
  calculateStreak,
  calculateStreakBonus,
  calculateRhythmScore,
  calculateFingerBalance,
  calculateErrorRecoveryTime,
  calculateSessionEfficiency,
  calculateLearningVelocity,
  analyzeTimeOfDayPerformance,
  analyzeFunnel,
  predictGoalAchievement,
  calculateSkillProfile,
} from '../utils/stats'
import type { TypingStats, KeystrokeData, WeeklyProgress } from '../types'

function makeStats(overrides: Partial<TypingStats> = {}): TypingStats {
  return {
    wpm: 0,
    cpm: 0,
    accuracy: 100,
    errors: 0,
    correctChars: 0,
    totalChars: 0,
    timeElapsed: 0,
    ...overrides,
  }
}

function makeKeystroke(overrides: Partial<KeystrokeData> = {}): KeystrokeData {
  return {
    key: 'a',
    timestamp: Date.now(),
    isCorrect: true,
    finger: 'index',
    hand: 'left',
    ...overrides,
  }
}

// ============================================================
// calculateStats
// ============================================================

describe('calculateStats', () => {
  it('returns zero stats when time is zero', () => {
    const stats = calculateStats(100, 120, 5, 0)
    expect(stats.wpm).toBe(0)
    expect(stats.cpm).toBe(0)
    expect(stats.accuracy).toBe(83)
    expect(stats.errors).toBe(5)
  })

  it('returns 100% accuracy when no chars typed', () => {
    const stats = calculateStats(0, 0, 0, 10)
    expect(stats.accuracy).toBe(100)
  })

  it('calculates correct WPM and CPM', () => {
    // 200 correct chars in 60 seconds = 200 / (60/60) / 5 = 40 WPM
    const stats = calculateStats(200, 220, 20, 60)
    expect(stats.wpm).toBe(40)
    expect(stats.cpm).toBe(200)
    expect(stats.accuracy).toBe(91)
    expect(stats.errors).toBe(20)
  })

  it('clamps accuracy to 0-100 range', () => {
    const stats = calculateStats(-10, 100, 0, 10)
    expect(stats.accuracy).toBe(0)
  })

  it('handles negative inputs safely', () => {
    const stats = calculateStats(-5, -3, -2, -10)
    expect(stats.wpm).toBe(0)
    expect(stats.cpm).toBe(0)
    expect(stats.errors).toBe(0)
    expect(stats.correctChars).toBe(0)
  })
})

// ============================================================
// Level system
// ============================================================

describe('calculateLevel', () => {
  it('level 1 at 0 XP', () => {
    expect(calculateLevel(0)).toBe(1)
  })

  it('level 2 at 100 XP', () => {
    expect(calculateLevel(100)).toBe(2)
  })

  it('level 11 at 10000 XP', () => {
    expect(calculateLevel(10000)).toBe(11)
  })
})

describe('xpForLevel', () => {
  it('level 1 needs 100 XP', () => {
    expect(xpForLevel(1)).toBe(100)
  })

  it('level 2 needs 400 XP', () => {
    expect(xpForLevel(2)).toBe(400)
  })

  it('level 10 needs 10000 XP', () => {
    expect(xpForLevel(10)).toBe(10000)
  })
})

describe('calculateLevelProgress', () => {
  it('0% progress at level start', () => {
    expect(calculateLevelProgress(0)).toBe(0)
  })

  it('50% progress between level 1 and 2', () => {
    // level 1 starts at 0, needs 100 for level 2
    // At 50 XP: (50 - 0) / (100 - 0) * 100 = 50%
    expect(calculateLevelProgress(50)).toBe(50)
  })

  it('0% progress at level 2 start (100 XP)', () => {
    expect(calculateLevelProgress(100)).toBe(0)
  })
})

// ============================================================
// calculateSessionXp
// ============================================================

describe('calculateSessionXp', () => {
  it('gives XP for time spent', () => {
    const stats = makeStats({ timeElapsed: 60, accuracy: 0, wpm: 0, errors: 0 })
    expect(calculateSessionXp(stats)).toBe(6)
  })

  it('gives bonus for perfect accuracy', () => {
    const stats = makeStats({ timeElapsed: 60, accuracy: 100, wpm: 10, errors: 0 })
    // time: 6 + perfect: 50 = 56
    expect(calculateSessionXp(stats)).toBe(56)
  })

  it('gives bonus for high WPM', () => {
    const stats = makeStats({ timeElapsed: 60, accuracy: 50, wpm: 70, errors: 0 })
    // time: 6 + wpm high: 50 = 56
    expect(calculateSessionXp(stats)).toBe(56)
  })

  it('penalizes errors', () => {
    const stats = makeStats({ timeElapsed: 60, accuracy: 50, wpm: 10, errors: 5 })
    // time: 6 + errors penalty: -10 = -4 -> clamped to 0
    expect(calculateSessionXp(stats)).toBe(0)
  })

  it('clamps result to minimum 0', () => {
    const stats = makeStats({ timeElapsed: 0, accuracy: 0, wpm: 0, errors: 100 })
    expect(calculateSessionXp(stats)).toBe(0)
  })
})

// ============================================================
// Achievements
// ============================================================

describe('checkAchievement', () => {
  const progress = { bestWpm: 45, bestAccuracy: 96, totalWordsTyped: 5000 }

  it('first-steps: WPM >= 10', () => {
    expect(checkAchievement('first-steps', progress, makeStats({ wpm: 15 }))).toBe(true)
    expect(checkAchievement('first-steps', progress, makeStats({ wpm: 5 }))).toBe(false)
  })

  it('speed-demon: bestWpm >= 40', () => {
    expect(checkAchievement('speed-demon', progress, makeStats())).toBe(true)
    expect(checkAchievement('speed-demon', { ...progress, bestWpm: 30 }, makeStats())).toBe(false)
  })

  it('accuracy-master: bestAccuracy >= 95', () => {
    expect(checkAchievement('accuracy-master', progress, makeStats())).toBe(true)
    expect(checkAchievement('accuracy-master', { ...progress, bestAccuracy: 90 }, makeStats())).toBe(false)
  })

  it('perfectionist: accuracy === 100 and WPM >= 30', () => {
    expect(checkAchievement('perfectionist', progress, makeStats({ accuracy: 100, wpm: 35 }))).toBe(true)
    expect(checkAchievement('perfectionist', progress, makeStats({ accuracy: 100, wpm: 20 }))).toBe(false)
  })

  it('returns false for unknown achievement', () => {
    expect(checkAchievement('unknown-id', progress, makeStats())).toBe(false)
  })
})

// ============================================================
// Key Heatmap
// ============================================================

describe('updateKeyHeatmap', () => {
  it('adds new key to heatmap', () => {
    const result = updateKeyHeatmap({}, 'a', true)
    expect(result['a']).toEqual({ errors: 0, total: 1, accuracy: 100 })
  })

  it('updates existing key with error', () => {
    const heatmap = updateKeyHeatmap({}, 'a', true)
    const updated = updateKeyHeatmap(heatmap, 'a', false)
    expect(updated['a']).toEqual({ errors: 1, total: 2, accuracy: 50 })
  })

  it('accumulates correctly', () => {
    let heatmap = updateKeyHeatmap({}, 'b', true)
    heatmap = updateKeyHeatmap(heatmap, 'b', true)
    heatmap = updateKeyHeatmap(heatmap, 'b', false)
    expect(heatmap['b']).toEqual({ errors: 1, total: 3, accuracy: 67 })
  })
})

describe('getHeatmapColor', () => {
  it('green for >= 95%', () => {
    expect(getHeatmapColor(100)).toBe('#22c55e')
  })

  it('lime for >= 85%', () => {
    expect(getHeatmapColor(90)).toBe('#84cc16')
  })

  it('yellow for >= 75%', () => {
    expect(getHeatmapColor(80)).toBe('#eab308')
  })

  it('orange for >= 60%', () => {
    expect(getHeatmapColor(65)).toBe('#f97316')
  })

  it('red for < 60%', () => {
    expect(getHeatmapColor(50)).toBe('#ef4444')
  })
})

// ============================================================
// Streak
// ============================================================

describe('calculateStreak', () => {
  it('returns 0 for empty array', () => {
    expect(calculateStreak([])).toBe(0)
  })

  it('returns 0 when no activity today or yesterday', () => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    expect(calculateStreak([threeDaysAgo.getTime()])).toBe(0)
  })

  it('returns 1 for today only', () => {
    expect(calculateStreak([Date.now()])).toBe(1)
  })

  it('returns 2 for today and yesterday', () => {
    const today = Date.now()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(calculateStreak([today, yesterday.getTime()])).toBe(2)
  })
})

describe('calculateStreakBonus', () => {
  it('1.0x for streak < 3', () => {
    expect(calculateStreakBonus(0)).toBe(1.0)
    expect(calculateStreakBonus(2)).toBe(1.0)
  })

  it('1.1x for streak 3-6', () => {
    expect(calculateStreakBonus(3)).toBe(1.1)
    expect(calculateStreakBonus(6)).toBe(1.1)
  })

  it('1.25x for streak 7-13', () => {
    expect(calculateStreakBonus(7)).toBe(1.25)
    expect(calculateStreakBonus(13)).toBe(1.25)
  })

  it('1.5x for streak 14-29', () => {
    expect(calculateStreakBonus(14)).toBe(1.5)
    expect(calculateStreakBonus(29)).toBe(1.5)
  })

  it('2.0x for streak >= 30', () => {
    expect(calculateStreakBonus(30)).toBe(2.0)
    expect(calculateStreakBonus(100)).toBe(2.0)
  })
})

// ============================================================
// Rhythm Score
// ============================================================

describe('calculateRhythmScore', () => {
  it('returns 100 for less than 2 keystrokes', () => {
    expect(calculateRhythmScore([])).toBe(100)
    expect(calculateRhythmScore([makeKeystroke()])).toBe(100)
  })

  it('returns 100 for perfectly even intervals', () => {
    const base = Date.now()
    const keys = [0, 1, 2, 3, 4].map(i =>
      makeKeystroke({ timestamp: base + i * 200 })
    )
    expect(calculateRhythmScore(keys)).toBe(100)
  })

  it('returns lower score for uneven intervals', () => {
    const base = Date.now()
    const keys = [
      makeKeystroke({ timestamp: base }),
      makeKeystroke({ timestamp: base + 100 }),
      makeKeystroke({ timestamp: base + 5000 }),
    ]
    expect(calculateRhythmScore(keys)).toBeLessThan(100)
  })
})

// ============================================================
// Finger Balance
// ============================================================

describe('calculateFingerBalance', () => {
  it('returns 50/50 for empty array', () => {
    expect(calculateFingerBalance([])).toEqual({ left: 50, right: 50 })
  })

  it('calculates balance for mixed hands', () => {
    const keys = [
      makeKeystroke({ hand: 'left' }),
      makeKeystroke({ hand: 'left' }),
      makeKeystroke({ hand: 'right' }),
      makeKeystroke({ hand: 'right' }),
    ]
    expect(calculateFingerBalance(keys)).toEqual({ left: 50, right: 50 })
  })

  it('returns 100% left for all left', () => {
    const keys = [
      makeKeystroke({ hand: 'left' }),
      makeKeystroke({ hand: 'left' }),
    ]
    expect(calculateFingerBalance(keys)).toEqual({ left: 100, right: 0 })
  })
})

// ============================================================
// Error Recovery Time
// ============================================================

describe('calculateErrorRecoveryTime', () => {
  it('returns 0 for no errors', () => {
    const keys = [
      makeKeystroke({ timestamp: 1000, isCorrect: true }),
      makeKeystroke({ timestamp: 1200, isCorrect: true }),
    ]
    expect(calculateErrorRecoveryTime(keys)).toBe(0)
  })

  it('calculates recovery time for errors', () => {
    const keys = [
      makeKeystroke({ timestamp: 1000, isCorrect: true }),
      makeKeystroke({ timestamp: 1200, isCorrect: false }),
      makeKeystroke({ timestamp: 1500, isCorrect: true }),
    ]
    // Recovery: 1500 - 1200 = 300ms
    expect(calculateErrorRecoveryTime(keys)).toBe(300)
  })
})

// ============================================================
// Session Efficiency
// ============================================================

describe('calculateSessionEfficiency', () => {
  it('returns 0 for zero time', () => {
    expect(calculateSessionEfficiency(makeStats())).toBe(0)
  })

  it('calculates efficiency correctly', () => {
    const stats = makeStats({ correctChars: 100, accuracy: 100, timeElapsed: 60 })
    // cps = 100/60 = 1.667, efficiency = 1.667 * 1.0 = 1.667
    expect(calculateSessionEfficiency(stats)).toBeCloseTo(1.67, 1)
  })
})

// ============================================================
// Learning Velocity
// ============================================================

describe('calculateLearningVelocity', () => {
  it('returns 0 for less than 2 weeks', () => {
    expect(calculateLearningVelocity([])).toBe(0)
    expect(calculateLearningVelocity([{ week: '2026-01-01', avgWpm: 50, sessions: 10 }])).toBe(0)
  })

  it('calculates WPM growth', () => {
    const data: WeeklyProgress[] = [
      { week: '2026-01-01', avgWpm: 40, sessions: 10 },
      { week: '2026-01-08', avgWpm: 55, sessions: 12 },
    ]
    expect(calculateLearningVelocity(data)).toBe(15)
  })

  it('handles negative growth', () => {
    const data: WeeklyProgress[] = [
      { week: '2026-01-01', avgWpm: 60, sessions: 10 },
      { week: '2026-01-08', avgWpm: 50, sessions: 8 },
    ]
    expect(calculateLearningVelocity(data)).toBe(-10)
  })
})

// ============================================================
// Time of Day Performance
// ============================================================

describe('analyzeTimeOfDayPerformance', () => {
  it('returns 4 periods for empty sessions', () => {
    const result = analyzeTimeOfDayPerformance([])
    expect(result).toHaveLength(4)
    expect(result.map(r => r.timeOfDay)).toEqual(['morning', 'afternoon', 'evening', 'night'])
  })

  it('categorizes morning sessions', () => {
    const sessions = [
      { timestamp: '2026-01-01T08:00:00Z', wpm: 40, accuracy: 95, timeElapsed: 60, errors: 2, correctChars: 100, totalChars: 110, cpm: 100 },
    ]
    const result = analyzeTimeOfDayPerformance(sessions)
    expect(result[0]?.avgWpm).toBe(40)
    expect(result[0]?.sessions).toBe(1)
  })
})

// ============================================================
// Funnel Analysis
// ============================================================

describe('analyzeFunnel', () => {
  it('returns empty array for no sessions', () => {
    expect(analyzeFunnel([], { started: 0, completed50: 10, completed80: 20, completed100: 30, highAccuracy: 90 })).toEqual([])
  })

  it('calculates funnel stages', () => {
    const sessions = [
      { timestamp: '2026-01-01T10:00:00Z', wpm: 40, accuracy: 95, timeElapsed: 60, errors: 2, correctChars: 100, totalChars: 110, cpm: 100 },
      { timestamp: '2026-01-01T11:00:00Z', wpm: 30, accuracy: 80, timeElapsed: 20, errors: 5, correctChars: 50, totalChars: 60, cpm: 50 },
    ]
    const result = analyzeFunnel(sessions, { started: 0, completed50: 10, completed80: 30, completed100: 60, highAccuracy: 90 })
    expect(result).toHaveLength(5)
    expect(result[0]?.count).toBe(2)
    expect(result[0]?.percentage).toBe(100)
  })
})

// ============================================================
// Predict Goal Achievement
// ============================================================

describe('predictGoalAchievement', () => {
  it('returns 0 weeks when goal already achieved', () => {
    const result = predictGoalAchievement(60, 50, 2)
    expect(result.weeks).toBe(0)
    expect(result.achievable).toBe(true)
  })

  it('calculates weeks needed', () => {
    const result = predictGoalAchievement(30, 50, 2)
    // (50 - 30) / 2 = 10 weeks
    expect(result.weeks).toBe(10)
    expect(result.achievable).toBe(true)
  })

  it('returns not achievable when velocity is 0 or negative', () => {
    const result = predictGoalAchievement(30, 50, 0)
    expect(result.achievable).toBe(false)
  })
})

// ============================================================
// Skill Profile
// ============================================================

describe('calculateSkillProfile', () => {
  it('returns profile with all metrics', () => {
    const stats = makeStats({ wpm: 50, accuracy: 90, timeElapsed: 60, correctChars: 100 })
    const keys = [
      makeKeystroke({ hand: 'left', timestamp: 1000, isCorrect: true }),
      makeKeystroke({ hand: 'right', timestamp: 1200, isCorrect: true }),
    ]
    const profile = calculateSkillProfile(stats, keys)
    expect(profile).toHaveProperty('Скорость (WPM)')
    expect(profile).toHaveProperty('Точность')
    expect(profile).toHaveProperty('Ритм')
    expect(profile).toHaveProperty('Эффективность')
    expect(profile).toHaveProperty('Баланс рук')
    expect(profile).toHaveProperty('Реакция')
  })

  it('returns 50 for balance and reaction with no keystrokes', () => {
    const stats = makeStats({ wpm: 50, accuracy: 90 })
    const profile = calculateSkillProfile(stats, [])
    expect(profile['Баланс рук']).toBe(50)
    expect(profile['Реакция']).toBe(50)
  })
})
