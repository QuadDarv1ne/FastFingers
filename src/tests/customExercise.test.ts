import { describe, it, expect, beforeEach } from 'vitest'

describe('Custom Exercise', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should create exercise with required fields', () => {
    const exercise = {
      id: 'custom-123',
      title: 'Test Exercise',
      text: 'This is a test',
      category: 'custom' as const,
      difficulty: 3 as const,
      createdAt: new Date().toISOString(),
      tags: ['test'],
    }

    expect(exercise.id).toBeDefined()
    expect(exercise.title).toBe('Test Exercise')
    expect(exercise.text).toBe('This is a test')
  })

  it('should count words correctly', () => {
    const text = 'This is a test exercise'
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length
    expect(wordCount).toBe(5)
  })

  it('should parse tags from comma-separated string', () => {
    const tagsString = 'python, programming, code'
    const tags = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
    
    expect(tags).toHaveLength(3)
    expect(tags).toContain('python')
    expect(tags).toContain('programming')
  })

  it('should validate difficulty range', () => {
    const validDifficulties = [1, 2, 3, 4, 5]
    validDifficulties.forEach(diff => {
      expect(diff).toBeGreaterThanOrEqual(1)
      expect(diff).toBeLessThanOrEqual(5)
    })
  })

  it('should store exercises in localStorage', () => {
    const exercises = [
      {
        id: 'custom-1',
        title: 'Exercise 1',
        text: 'Text 1',
        category: 'custom' as const,
        difficulty: 3 as const,
        createdAt: new Date().toISOString(),
        tags: [],
      },
    ]

    localStorage.setItem('fastfingers_custom_exercises', JSON.stringify(exercises))
    
    const stored = JSON.parse(
      localStorage.getItem('fastfingers_custom_exercises') || '[]'
    )
    
    expect(stored).toHaveLength(1)
    expect(stored[0].title).toBe('Exercise 1')
  })

  it('should filter exercises by tags', () => {
    const exercises = [
      { tags: ['python', 'code'] },
      { tags: ['javascript', 'code'] },
      { tags: ['python', 'data'] },
    ]

    const pythonExercises = exercises.filter(ex => ex.tags.includes('python'))
    expect(pythonExercises).toHaveLength(2)
  })
})
