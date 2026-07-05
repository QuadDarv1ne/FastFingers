import { describe, it, expect } from 'vitest'
import {
  calculateStats,
  calculateLevel,
  xpForLevel,
  calculateSessionXp,
  checkAchievement,
  updateKeyHeatmap,
  getHeatmapColor,
} from '../utils/stats'
import type { TypingStats } from '../types'

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

describe('calculateSessionXp', () => {
  it('gives XP for time spent', () => {
    const stats = makeStats({ timeElapsed: 60, accuracy: 0, wpm: 0, errors: 0 })
    expect(calculateSessionXp(stats)).toBe(6)
  })

  it('gives bonus for perfect accuracy', () => {
    const stats = makeStats({ timeElapsed: 60, accuracy: 100, wpm: 10, errors: 0 })
    expect(calculateSessionXp(stats)).toBe(56)
  })

  it('gives bonus for high WPM', () => {
    const stats = makeStats({ timeElapsed: 60, accuracy: 50, wpm: 70, errors: 0 })
    expect(calculateSessionXp(stats)).toBe(56)
  })

  it('penalizes errors', () => {
    const stats = makeStats({ timeElapsed: 60, accuracy: 50, wpm: 10, errors: 5 })
    expect(calculateSessionXp(stats)).toBe(0)
  })

  it('clamps result to minimum 0', () => {
    const stats = makeStats({ timeElapsed: 0, accuracy: 0, wpm: 0, errors: 100 })
    expect(calculateSessionXp(stats)).toBe(0)
  })
})

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
