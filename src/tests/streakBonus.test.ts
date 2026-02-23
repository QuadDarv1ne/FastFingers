import { describe, it, expect } from 'vitest'
import { calculateStreakXpBonus } from '../utils/streakBonus'

describe('streakBonus utils', () => {
  describe('calculateStreakXpBonus', () => {
    it('должен возвращать 0 для серии менее 3 дней', () => {
      expect(calculateStreakXpBonus(0)).toBe(0)
      expect(calculateStreakXpBonus(1)).toBe(0)
      expect(calculateStreakXpBonus(2)).toBe(0)
    })

    it('должен возвращать 50 XP за 3 дня', () => {
      expect(calculateStreakXpBonus(3)).toBe(50)
    })

    it('должен возвращать 50 XP за 4-6 дней', () => {
      expect(calculateStreakXpBonus(4)).toBe(50)
      expect(calculateStreakXpBonus(5)).toBe(50)
      expect(calculateStreakXpBonus(6)).toBe(50)
    })

    it('должен возвращать 150 XP за 7 дней', () => {
      expect(calculateStreakXpBonus(7)).toBe(150)
    })

    it('должен возвращать 150 XP за 8-13 дней', () => {
      expect(calculateStreakXpBonus(8)).toBe(150)
      expect(calculateStreakXpBonus(13)).toBe(150)
    })

    it('должен возвращать 400 XP за 14 дней', () => {
      expect(calculateStreakXpBonus(14)).toBe(400)
    })

    it('должен возвращать 400 XP за 15-29 дней', () => {
      expect(calculateStreakXpBonus(20)).toBe(400)
      expect(calculateStreakXpBonus(29)).toBe(400)
    })

    it('должен возвращать 1000 XP за 30 дней', () => {
      expect(calculateStreakXpBonus(30)).toBe(1000)
    })

    it('должен возвращать 1000 XP за более чем 30 дней', () => {
      expect(calculateStreakXpBonus(50)).toBe(1000)
      expect(calculateStreakXpBonus(100)).toBe(1000)
      expect(calculateStreakXpBonus(365)).toBe(1000)
    })
  })
})
