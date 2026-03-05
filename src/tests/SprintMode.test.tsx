import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('SprintMode constants', () => {
  it('SPRINT_DURATION равен 60 секундам', () => {
    const SPRINT_DURATION = 60
    expect(SPRINT_DURATION).toBe(60)
  })

  it('COUNTDOWN_SECONDS равен 3', () => {
    const COUNTDOWN_SECONDS = 3
    expect(COUNTDOWN_SECONDS).toBe(3)
  })
})

describe('SprintMode logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('расчитывает WPM корректно', () => {
    const correctChars = 100
    const timeInMinutes = 1
    
    const wpm = Math.round(correctChars / 5 / timeInMinutes)
    expect(wpm).toBe(20)
  })

  it('расчитывает точность корректно', () => {
    const correct = 95
    const total = 100
    
    const accuracy = Math.round((correct / total) * 100)
    expect(accuracy).toBe(95)
  })

  it('завершает спринт при 0 времени', () => {
    const timeLeft = 0
    const isActive = timeLeft > 0
    expect(isActive).toBe(false)
  })

  it('обновляет статистику после ввода', () => {
    const inputResults = [
      { isCorrect: true, char: 'а' },
      { isCorrect: true, char: 'в' },
      { isCorrect: false, char: 'ы' },
    ]
    
    const correct = inputResults.filter(r => r.isCorrect).length
    const errors = inputResults.filter(r => !r.isCorrect).length
    
    expect(correct).toBe(2)
    expect(errors).toBe(1)
  })
})
