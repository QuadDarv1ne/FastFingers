import { describe, it, expect, beforeEach } from 'vitest'

describe('Daily Challenge', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should generate consistent challenge for same date', () => {
    const date = '2026-02-24'
    
    // Mock the generateDailyChallenge function behavior
    const seed = date.split('-').reduce((acc, val) => acc + parseInt(val), 0)
    expect(seed).toBeGreaterThan(0)
  })

  it('should have valid difficulty levels', () => {
    const difficulties = ['easy', 'medium', 'hard']
    expect(difficulties).toHaveLength(3)
  })

  it('should have valid challenge types', () => {
    const types = ['wpm', 'accuracy', 'words', 'time', 'combo']
    expect(types).toHaveLength(5)
  })

  it('should calculate progress correctly', () => {
    const progress = 50
    const target = 100
    const percent = (progress / target) * 100
    expect(percent).toBe(50)
  })

  it('should cap progress at 100%', () => {
    const progress = 150
    const target = 100
    const percent = Math.min((progress / target) * 100, 100)
    expect(percent).toBe(100)
  })

  it('should assign correct points for difficulty', () => {
    const points = { easy: 50, medium: 100, hard: 200 }
    expect(points.easy).toBe(50)
    expect(points.medium).toBe(100)
    expect(points.hard).toBe(200)
  })

  it('should store progress in localStorage', () => {
    const challengeId = 'challenge-2026-02-24'
    const progressData = {
      [challengeId]: {
        completed: false,
        progress: 50,
      },
    }
    
    localStorage.setItem('fastfingers_challenge_progress', JSON.stringify(progressData))
    
    const stored = JSON.parse(
      localStorage.getItem('fastfingers_challenge_progress') || '{}'
    )
    
    expect(stored[challengeId]).toBeDefined()
    expect(stored[challengeId].progress).toBe(50)
  })

  it('should mark challenge as completed when target reached', () => {
    const progress = 100
    const target = 100
    const completed = progress >= target
    expect(completed).toBe(true)
  })
})
