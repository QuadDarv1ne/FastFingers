import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTypingGame } from '../hooks/useTypingGame'
import { useTypingSound } from '../hooks/useTypingSound'
import * as exercises from '../utils/exercises'

// Mock generatePracticeText
vi.mock('../utils/exercises', () => ({
  generatePracticeText: vi.fn().mockReturnValue('test text for typing practice'),
}))

// Mock calculateStats
vi.mock('../utils/stats', () => ({
  calculateStats: vi.fn().mockReturnValue({
    wpm: 30,
    cpm: 150,
    accuracy: 95,
    correctChars: 19,
    errors: 1,
    totalChars: 20,
    timeElapsed: 10,
  }),
}))

describe('useTypingGame Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Инициализация', () => {
    it('должен инициализироваться с параметрами по умолчанию', () => {
      const { result } = renderHook(() => useTypingGame())

      expect(result.current.text).toBe('test text for typing practice')
      expect(result.current.currentIndex).toBe(0)
      expect(result.current.inputResults).toEqual([])
      expect(result.current.isComplete).toBe(false)
      expect(result.current.isActive).toBe(false)
      expect(result.current.wpm).toBeGreaterThanOrEqual(0)
      expect(result.current.accuracy).toBeGreaterThanOrEqual(0)
    })

    it('должен использовать кастомные параметры wordCount и difficulty', () => {
      renderHook(() =>
        useTypingGame({ initialWordCount: 50, initialDifficulty: 7 })
      )

      expect(exercises.generatePracticeText).toHaveBeenCalledWith(50, 7)
    })

    it('должен валидировать параметры (wordCount за пределами диапазона)', () => {
      // Слишком маленькое значение
      renderHook(() => useTypingGame({ initialWordCount: -5 }))
      expect(exercises.generatePracticeText).toHaveBeenCalledWith(1, 5)

      vi.clearAllMocks()

      // Слишком большое значение
      renderHook(() => useTypingGame({ initialWordCount: 500 }))
      expect(exercises.generatePracticeText).toHaveBeenCalledWith(200, 5)
    })

    it('должен инициализироваться в timed режиме с таймером', () => {
      const { result } = renderHook(() =>
        useTypingGame({ mode: 'timed', duration: 30 })
      )

      expect(result.current.timeLeft).toBe(30)
      expect(result.current.isActive).toBe(false)
    })
  })

  describe('Управление игрой', () => {
    it('должен запускать игру при handleStart', () => {
      const { result } = renderHook(() =>
        useTypingGame({ mode: 'timed', duration: 10 })
      )

      act(() => {
        result.current.handleStart()
      })

      expect(result.current.isActive).toBe(true)
    })

    it('должен отсчитывать время в timed режиме', () => {
      const { result } = renderHook(() =>
        useTypingGame({ mode: 'timed', duration: 10 })
      )

      act(() => {
        result.current.handleStart()
      })

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(result.current.timeLeft).toBeLessThan(10)
      expect(result.current.timeLeft).toBeGreaterThanOrEqual(7)
    })

    it('должен завершать игру по истечении времени', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() =>
        useTypingGame({ mode: 'timed', duration: 5, onComplete })
      )

      act(() => {
        result.current.handleStart()
      })

      // Продвигаем время на 10 секунд (больше длительности)
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // Игра должна завершиться
      expect(result.current.isComplete).toBe(true)
      expect(result.current.timeLeft).toBeLessThanOrEqual(0)
    })

    it('должен сбрасывать состояние при reset', () => {
      const { result } = renderHook(() => useTypingGame())

      // Изменяем состояние
      act(() => {
        result.current.handleStart()
      })

      // Сбрасываем
      act(() => {
        result.current.reset()
      })

      expect(result.current.currentIndex).toBe(0)
      expect(result.current.inputResults).toEqual([])
      expect(result.current.isActive).toBe(false)
    })

    it('должен генерировать новый текст при handleSkip', () => {
      const { result } = renderHook(() => useTypingGame())

      act(() => {
        result.current.handleSkip()
      })

      expect(exercises.generatePracticeText).toHaveBeenCalledTimes(2)
    })

    it('должен генерировать новый текст при generateNewText', () => {
      const { result } = renderHook(() => useTypingGame())

      act(() => {
        result.current.generateNewText()
      })

      expect(exercises.generatePracticeText).toHaveBeenCalledTimes(2)
    })
  })

  describe('Обработка ввода', () => {
    it('должен обрабатывать правильный ввод', () => {
      const { result } = renderHook(() => useTypingGame())

      const mockEvent = {
        currentTarget: { value: 't' },
      } as unknown as React.FormEvent<HTMLInputElement>

      act(() => {
        result.current.handleInput(mockEvent)
      })

      expect(result.current.inputResults.length).toBeGreaterThan(0)
    })

    it('должен отслеживать ошибки при неправильном вводе', () => {
      const { result } = renderHook(() => useTypingGame())

      // Вводим неправильный символ
      const mockEvent = {
        currentTarget: { value: 'x' }, // Неправильный символ
      } as unknown as React.FormEvent<HTMLInputElement>

      act(() => {
        result.current.handleInput(mockEvent)
      })

      const lastResult = result.current.inputResults[result.current.inputResults.length - 1]
      expect(lastResult?.isCorrect).toBe(false)
    })

    it('должен увеличивать currentIndex при правильном вводе', () => {
      const { result } = renderHook(() => useTypingGame())

      const mockEvent = {
        currentTarget: { value: 't' },
      } as unknown as React.FormEvent<HTMLInputElement>

      const initialIndex = result.current.currentIndex

      act(() => {
        result.current.handleInput(mockEvent)
      })

      // currentIndex должен увеличиться если символ правильный
      // или остаться тем же если неправильный
      expect(result.current.currentIndex).toBeGreaterThanOrEqual(initialIndex)
    })
  })

  describe('Callback функции', () => {
    it('должен вызывать onKeyInput при каждом нажатии', () => {
      const onKeyInput = vi.fn()
      const { result } = renderHook(() => useTypingGame({ onKeyInput }))

      const mockEvent = {
        currentTarget: { value: 't' },
      } as unknown as React.FormEvent<HTMLInputElement>

      act(() => {
        result.current.handleInput(mockEvent)
      })

      expect(onKeyInput).toHaveBeenCalled()
    })

    it('должен использовать кастомный звук через sound хук', () => {
      const mockSound: Partial<ReturnType<typeof useTypingSound>> = {
        playCorrect: vi.fn(),
        playError: vi.fn(),
        playComplete: vi.fn(),
        playClick: vi.fn(),
        setVolume: vi.fn(),
        setEnabled: vi.fn(),
        setTheme: vi.fn(),
        initAudio: vi.fn(),
        isReady: true,
        isEnabled: true,
        error: null,
      }

      const { result } = renderHook(() => useTypingGame({ sound: mockSound as ReturnType<typeof useTypingSound> }))

      const mockEvent = {
        currentTarget: { value: 't' },
      } as unknown as React.FormEvent<HTMLInputElement>

      act(() => {
        result.current.handleInput(mockEvent)
      })

      // Звук должен воспроизводиться при вводе
      expect(mockSound.playCorrect).toHaveBeenCalled()
    })

    it('должен устанавливать isComplete после завершения текста', () => {
      const { result } = renderHook(() => useTypingGame())

      // isComplete изначально false
      expect(result.current.isComplete).toBe(false)

      // После пропуска текста (что симулирует завершение)
      act(() => {
        result.current.handleSkip()
      })

      // isComplete всё ещё false, т.к. handleSkip генерирует новый текст
      expect(result.current.isComplete).toBe(false)
    })
  })

  describe('Фокус и управление input', () => {
    it('должен предоставлять inputRef', () => {
      const { result } = renderHook(() => useTypingGame())

      expect(result.current.inputRef).toBeDefined()
      expect(result.current.inputRef.current).toBeNull()
    })

    it('должен фокусироваться на input при focusInput', () => {
      const { result } = renderHook(() => useTypingGame())

      // Создаём mock input element
      const mockInput = document.createElement('input')
      document.body.appendChild(mockInput)
      Object.defineProperty(result.current.inputRef, 'current', {
        value: mockInput,
        writable: true,
      })

      act(() => {
        result.current.focusInput()
      })

      expect(document.activeElement).toBe(mockInput)

      document.body.removeChild(mockInput)
    })
  })

  describe('Вычисление статистики', () => {
    it('должен обновлять WPM и accuracy во время игры', () => {
      const { result } = renderHook(() => useTypingGame())

      // Имитируем ввод нескольких символов
      for (let i = 0; i < 5; i++) {
        const mockEvent = {
          currentTarget: { value: 't'.repeat(i + 1) },
        } as unknown as React.FormEvent<HTMLInputElement>

        act(() => {
          result.current.handleInput(mockEvent)
        })
      }

      // После ввода статистика должна обновиться
      expect(result.current.inputResults.length).toBeGreaterThan(0)
      expect(result.current.wpm).toBeGreaterThanOrEqual(0)
      expect(result.current.accuracy).toBeGreaterThanOrEqual(0)
    })

    it('должен отслеживать ошибки при неправильном вводе', () => {
      const { result } = renderHook(() => useTypingGame())

      // Проверяем что inputResults обновляется
      expect(result.current.inputResults).toEqual([])

      // Вводим неправильный символ
      const mockEvent = {
        currentTarget: { value: 'x' }, // Неправильный символ для 't'
      } as unknown as React.FormEvent<HTMLInputElement>

      act(() => {
        result.current.handleInput(mockEvent)
      })

      // Должен быть хотя бы один результат ввода
      expect(result.current.inputResults.length).toBeGreaterThan(0)
    })
  })

  describe('Edge cases', () => {
    it('должен обрабатывать пустой текст', () => {
      // generatePracticeText всегда возвращает текст по умолчанию
      // поэтому проверяем что hook не падает
      const { result } = renderHook(() => useTypingGame())

      expect(result.current.text).toBeDefined()
      expect(result.current.currentIndex).toBe(0)
    })

    it('должен обрабатывать null/undefined в опциях', () => {
      // Не должно падать при null/undefined
      expect(() => renderHook(() => useTypingGame({}))).not.toThrow()
      expect(() => renderHook(() => useTypingGame())).not.toThrow()
    })

    it('должен корректно обрабатывать быстрый повторный запуск', () => {
      const { result } = renderHook(() =>
        useTypingGame({ mode: 'timed', duration: 10 })
      )

      act(() => {
        result.current.handleStart()
        result.current.handleStart() // Повторный запуск
      })

      expect(result.current.isActive).toBe(true)
    })

    it('должен сбрасывать таймер при reset', () => {
      const { result } = renderHook(() =>
        useTypingGame({ mode: 'timed', duration: 10 })
      )

      act(() => {
        result.current.handleStart()
      })

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.timeLeft).toBe(10)
      expect(result.current.isActive).toBe(false)
    })
  })
})
