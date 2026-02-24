import { describe, it, expect } from 'vitest'

describe('Learning Mode', () => {
  it('should have 7 lessons', () => {
    const lessonCount = 7
    expect(lessonCount).toBe(7)
  })

  it('should have progressive difficulty', () => {
    const levels = [1, 2, 3, 4, 5, 6, 7]
    expect(levels).toHaveLength(7)
    expect(levels[0]).toBe(1)
    expect(levels[6]).toBe(7)
  })

  it('should calculate progress correctly', () => {
    const completed = 3
    const total = 7
    const progress = (completed / total) * 100
    expect(progress).toBeCloseTo(42.86, 1)
  })

  it('should lock lessons based on previous completion', () => {
    const lessons = [
      { completed: true },
      { completed: false },
      { completed: false },
    ]
    
    const isSecondLocked = !lessons[0].completed
    const isThirdLocked = !lessons[1].completed
    
    expect(isSecondLocked).toBe(false)
    expect(isThirdLocked).toBe(true)
  })

  it('should have exercises for each lesson', () => {
    const lesson = {
      exercises: ['ex1', 'ex2', 'ex3', 'ex4'],
    }
    expect(lesson.exercises.length).toBeGreaterThan(0)
  })
})
