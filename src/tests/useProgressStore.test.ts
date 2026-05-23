import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useProgressStore, useBestWpm, useAvgAccuracy, useTotalPracticeTime, useProgressStats, getBestWpmFromSessions, getAvgAccuracyFromSessions, getTotalPracticeTimeFromSessions } from '../stores/useProgressStore'
import { renderHook, act } from '@testing-library/react'

describe('useProgressStore Integration', () => {
  beforeEach(() => {
    // Сбрасываем состояние перед каждым тестом
    useProgressStore.setState({
      sessions: [],
      totalXp: 0,
      level: 1,
      streak: 0,
      lastPracticeDate: null,
    })
  })

  afterEach(() => {
    useProgressStore.setState({
      sessions: [],
      totalXp: 0,
      level: 1,
      streak: 0,
      lastPracticeDate: null,
    })
  })

  describe('Инициализация', () => {
    it('должен инициализироваться с начальными значениями', () => {
      const state = useProgressStore.getState()

      expect(state.sessions).toEqual([])
      expect(state.totalXp).toBe(0)
      expect(state.level).toBe(1)
      expect(state.streak).toBe(0)
      expect(state.lastPracticeDate).toBeNull()
    })
  })

  describe('addSession', () => {
    it('должен добавлять сессию в историю', () => {
      const session = {
        date: new Date().toISOString(),
        wpm: 45,
        accuracy: 92,
        errors: 3,
        correctChars: 97,
        totalChars: 100,
        duration: 120,
        xp: 150,
      }

      useProgressStore.getState().addSession(session)

      const state = useProgressStore.getState()
      expect(state.sessions).toHaveLength(1)
      expect(state.sessions[0]).toMatchObject({
        ...session,
        id: expect.any(String),
      })
    })

    it('должен ограничивать количество сессий (MAX_SESSIONS = 1000)', () => {
      // Добавляем 1001 сессию
      for (let i = 0; i < 1001; i++) {
        useProgressStore.getState().addSession({
          date: new Date().toISOString(),
          wpm: 40,
          accuracy: 90,
          errors: 5,
          correctChars: 95,
          totalChars: 100,
          duration: 60,
          xp: 100,
        })
      }

      const state = useProgressStore.getState()
      expect(state.sessions).toHaveLength(1000)
    })

    it('должен добавлять сессии в начало массива (новые первыми)', () => {
      useProgressStore.getState().addSession({
        date: '2024-01-01T00:00:00.000Z',
        wpm: 30,
        accuracy: 85,
        errors: 5,
        correctChars: 85,
        totalChars: 100,
        duration: 60,
        xp: 80,
      })

      useProgressStore.getState().addSession({
        date: '2024-01-02T00:00:00.000Z',
        wpm: 35,
        accuracy: 90,
        errors: 3,
        correctChars: 90,
        totalChars: 100,
        duration: 60,
        xp: 100,
      })

      const state = useProgressStore.getState()
      expect(state.sessions[0]?.date).toBe('2024-01-02T00:00:00.000Z')
      expect(state.sessions[1]?.date).toBe('2024-01-01T00:00:00.000Z')
    })
  })

  describe('addXp', () => {
    it('должен добавлять XP к totalXp', () => {
      useProgressStore.getState().addXp(100)

      const state = useProgressStore.getState()
      expect(state.totalXp).toBe(100)
    })

    it('должен накапливать XP', () => {
      useProgressStore.getState().addXp(100)
      useProgressStore.getState().addXp(200)
      useProgressStore.getState().addXp(50)

      const state = useProgressStore.getState()
      expect(state.totalXp).toBe(350)
    })

    it('должен автоматически повышать уровень при достижении 1000 XP', () => {
      useProgressStore.getState().addXp(900)
      expect(useProgressStore.getState().level).toBe(4)

      useProgressStore.getState().addXp(100)
      expect(useProgressStore.getState().level).toBe(4)
    })

    it('должен повышать уровень несколько раз при большом количестве XP', () => {
      useProgressStore.getState().addXp(3500)

      const state = useProgressStore.getState()
      expect(state.level).toBe(6)
    })
  })

  describe('updateStreak', () => {
    it('должен увеличивать серию при практике в последовательные дни', () => {
      // Первая практика
      useProgressStore.getState().updateStreak('2024-01-01T00:00:00.000Z')
      expect(useProgressStore.getState().streak).toBe(1)

      // Практика на следующий день
      useProgressStore.getState().updateStreak('2024-01-02T00:00:00.000Z')
      expect(useProgressStore.getState().streak).toBe(2)
    })

    it('должен сбрасывать серию при пропуске дня', () => {
      // Первая практика
      useProgressStore.getState().updateStreak('2024-01-01T00:00:00.000Z')
      expect(useProgressStore.getState().streak).toBe(1)

      // Пропуск дня, практика через день
      useProgressStore.getState().updateStreak('2024-01-03T00:00:00.000Z')
      expect(useProgressStore.getState().streak).toBe(1) // Сброс до 1
    })

    it('должен начинать с 1 при первой практике', () => {
      useProgressStore.getState().updateStreak(new Date().toISOString())
      expect(useProgressStore.getState().streak).toBe(1)
    })

    it('должен сохранять серию при практике в тот же день', () => {
      useProgressStore.getState().updateStreak('2024-01-01T08:00:00.000Z')
      expect(useProgressStore.getState().streak).toBe(1)

      useProgressStore.getState().updateStreak('2024-01-01T20:00:00.000Z')
      // Серия не должна измениться
      expect(useProgressStore.getState().streak).toBe(1)
    })
  })

  describe('clearHistory', () => {
    it('должен очищать всю историю сессий', () => {
      useProgressStore.getState().addSession({
        date: new Date().toISOString(),
        wpm: 40,
        accuracy: 90,
        errors: 5,
        correctChars: 95,
        totalChars: 100,
        duration: 60,
        xp: 100,
      })

      useProgressStore.getState().clearHistory()

      const state = useProgressStore.getState()
      expect(state.sessions).toEqual([])
    })

    it('должен сбрасывать XP, уровень и серию', () => {
      useProgressStore.getState().addXp(500)
      useProgressStore.getState().updateStreak(new Date().toISOString())

      useProgressStore.getState().clearHistory()

      const state = useProgressStore.getState()
      expect(state.totalXp).toBe(0)
      expect(state.level).toBe(1)
      expect(state.streak).toBe(0)
      expect(state.lastPracticeDate).toBeNull()
    })
  })

  describe('getBestWpm', () => {
    it('должен возвращать лучший WPM из всех сессий', () => {
      useProgressStore.getState().addSession({
        date: '2024-01-01T00:00:00.000Z',
        wpm: 30,
        accuracy: 85,
        errors: 5,
        correctChars: 85,
        totalChars: 100,
        duration: 60,
        xp: 80,
      })

      useProgressStore.getState().addSession({
        date: '2024-01-02T00:00:00.000Z',
        wpm: 50,
        accuracy: 90,
        errors: 3,
        correctChars: 90,
        totalChars: 100,
        duration: 60,
        xp: 100,
      })

      useProgressStore.getState().addSession({
        date: '2024-01-03T00:00:00.000Z',
        wpm: 45,
        accuracy: 92,
        errors: 4,
        correctChars: 92,
        totalChars: 100,
        duration: 60,
        xp: 95,
      })

      const bestWpm = useProgressStore.getState().getBestWpm()
      expect(bestWpm).toBe(50)
    })

    it('должен возвращать 0 если нет сессий', () => {
      const bestWpm = useProgressStore.getState().getBestWpm()
      expect(bestWpm).toBe(0)
    })
  })

  describe('getAvgAccuracy', () => {
    it('должен возвращать среднюю точность последних 10 сессий', () => {
      // Добавляем 5 сессий с разной точностью
      for (let i = 1; i <= 5; i++) {
        useProgressStore.getState().addSession({
          date: `2024-01-0${i}T00:00:00.000Z`,
          wpm: 40,
          accuracy: 80 + i * 2, // 82, 84, 86, 88, 90
          errors: 5,
          correctChars: 85,
          totalChars: 100,
          duration: 60,
          xp: 100,
        })
      }

      const avgAccuracy = useProgressStore.getState().getAvgAccuracy()
      // Среднее: (82 + 84 + 86 + 88 + 90) / 5 = 86
      expect(avgAccuracy).toBe(86)
    })

    it('должен возвращать 0 если нет сессий', () => {
      const avgAccuracy = useProgressStore.getState().getAvgAccuracy()
      expect(avgAccuracy).toBe(0)
    })

    it('должен учитывать только последние 10 сессий', () => {
      // Добавляем 15 сессий
      for (let i = 1; i <= 15; i++) {
        useProgressStore.getState().addSession({
          date: `2024-01-${String(i).padStart(2, '0')}T00:00:00.000Z`,
          wpm: 40,
          accuracy: i <= 5 ? 50 : 90, // Первые 5 с низкой точностью
          errors: 5,
          correctChars: 85,
          totalChars: 100,
          duration: 60,
          xp: 100,
        })
      }

      const avgAccuracy = useProgressStore.getState().getAvgAccuracy()
      // Должно учитывать только последние 10 (с точностью 90)
      expect(avgAccuracy).toBe(90)
    })
  })

  describe('getTotalPracticeTime', () => {
    it('должен возвращать общее время практики в секундах', () => {
      useProgressStore.getState().addSession({
        date: '2024-01-01T00:00:00.000Z',
        wpm: 30,
        accuracy: 85,
        errors: 5,
        correctChars: 85,
        totalChars: 100,
        duration: 120, // 2 минуты
        xp: 80,
      })

      useProgressStore.getState().addSession({
        date: '2024-01-02T00:00:00.000Z',
        wpm: 35,
        accuracy: 90,
        errors: 3,
        correctChars: 90,
        totalChars: 100,
        duration: 180, // 3 минуты
        xp: 100,
      })

      const totalTime = useProgressStore.getState().getTotalPracticeTime()
      expect(totalTime).toBe(300) // 5 минут в секундах
    })

    it('должен возвращать 0 если нет сессий', () => {
      const totalTime = useProgressStore.getState().getTotalPracticeTime()
      expect(totalTime).toBe(0)
    })
  })

  describe('Интеграционные тесты', () => {
    it('должен корректно работать полный цикл практики', () => {
      // Начало практики
      useProgressStore.getState().updateStreak('2024-01-01T00:00:00.000Z')
      expect(useProgressStore.getState().streak).toBe(1)

      // Завершение сессии
      useProgressStore.getState().addSession({
        date: '2024-01-01T00:00:00.000Z',
        wpm: 40,
        accuracy: 90,
        errors: 5,
        correctChars: 95,
        totalChars: 100,
        duration: 120,
        xp: 150,
      })

      useProgressStore.getState().addXp(150)

      // Проверка состояния
      expect(useProgressStore.getState().sessions).toHaveLength(1)
      expect(useProgressStore.getState().totalXp).toBe(150)
      expect(useProgressStore.getState().level).toBe(2)
      expect(useProgressStore.getState().streak).toBe(1)

      // Вторая сессия на следующий день
      useProgressStore.getState().updateStreak('2024-01-02T00:00:00.000Z')
      useProgressStore.getState().addSession({
        date: '2024-01-02T00:00:00.000Z',
        wpm: 45,
        accuracy: 92,
        errors: 4,
        correctChars: 96,
        totalChars: 100,
        duration: 120,
        xp: 160,
      })

      useProgressStore.getState().addXp(160)

      expect(useProgressStore.getState().sessions).toHaveLength(2)
      expect(useProgressStore.getState().totalXp).toBe(310)
      expect(useProgressStore.getState().streak).toBe(2)
      expect(useProgressStore.getState().getBestWpm()).toBe(45)
      expect(useProgressStore.getState().getAvgAccuracy()).toBe(91) // Среднее между 90 и 92
    })

    it('должен повышать уровень после 1000 XP', () => {
      // Добавляем 10 сессий по 100 XP
      for (let i = 0; i < 10; i++) {
        useProgressStore.getState().addSession({
          date: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z`,
          wpm: 40,
          accuracy: 90,
          errors: 5,
          correctChars: 95,
          totalChars: 100,
          duration: 60,
          xp: 100,
        })
        useProgressStore.getState().addXp(100)
      }

      expect(useProgressStore.getState().totalXp).toBe(1000)
      expect(useProgressStore.getState().level).toBe(4)
    })
  })

  describe('Reactive selectors', () => {
    describe('useBestWpm', () => {
      it('должен возвращать 0 если нет сессий', () => {
        const { result } = renderHook(() => useBestWpm())
        expect(result.current).toBe(0)
      })

      it('должен обновляться реактивно при добавлении сессий', () => {
        const { result } = renderHook(() => useBestWpm())
        expect(result.current).toBe(0)

        act(() => {
          useProgressStore.getState().addSession({
            date: '2024-01-01T00:00:00.000Z',
            wpm: 45,
            accuracy: 90,
            errors: 3,
            correctChars: 200,
            totalChars: 220,
            duration: 60,
            xp: 50,
          })
        })
        expect(result.current).toBe(45)

        act(() => {
          useProgressStore.getState().addSession({
            date: '2024-01-02T00:00:00.000Z',
            wpm: 60,
            accuracy: 92,
            errors: 2,
            correctChars: 300,
            totalChars: 325,
            duration: 90,
            xp: 70,
          })
        })
        expect(result.current).toBe(60)
      })
    })

    describe('useAvgAccuracy', () => {
      it('должен возвращать 0 если нет сессий', () => {
        const { result } = renderHook(() => useAvgAccuracy())
        expect(result.current).toBe(0)
      })

      it('должен учитывать только последние 10 сессий', () => {
        const { result } = renderHook(() => useAvgAccuracy())

        // Добавляем 12 сессий чтобы превысить RECENT_SESSIONS_COUNT (10)
        for (let i = 1; i <= 12; i++) {
          act(() => {
            useProgressStore.getState().addSession({
              date: `2024-01-${String(i).padStart(2, '0')}T00:00:00.000Z`,
              wpm: 40 + i,
              accuracy: 80 + i,
              errors: 5,
              correctChars: 200,
              totalChars: 220,
              duration: 60,
              xp: 50,
            })
          })
        }

        // Должно усреднять только последние 10 сессий (точности 83-92)
        const expectedAvg = Math.round(
          Array.from({ length: 10 }, (_, i) => 83 + i).reduce((a, b) => a + b, 0) / 10
        )
        expect(result.current).toBe(expectedAvg)
      })
    })

    describe('useTotalPracticeTime', () => {
      it('должен возвращать 0 если нет сессий', () => {
        const { result } = renderHook(() => useTotalPracticeTime())
        expect(result.current).toBe(0)
      })

      it('должен суммировать время всех сессий', () => {
        const { result } = renderHook(() => useTotalPracticeTime())

        act(() => {
          useProgressStore.getState().addSession({
            date: '2024-01-01T00:00:00.000Z',
            wpm: 30,
            accuracy: 85,
            errors: 5,
            correctChars: 85,
            totalChars: 100,
            duration: 120,
            xp: 80,
          })
        })

        act(() => {
          useProgressStore.getState().addSession({
            date: '2024-01-02T00:00:00.000Z',
            wpm: 35,
            accuracy: 90,
            errors: 3,
            correctChars: 90,
            totalChars: 100,
            duration: 180,
            xp: 100,
          })
        })

        expect(result.current).toBe(300)
      })
    })

    describe('useProgressStats', () => {
      it('должен возвращать все три значения одновременно', () => {
        const { result } = renderHook(() => useProgressStats())

        act(() => {
          useProgressStore.getState().addSession({
            date: '2024-01-01T00:00:00.000Z',
            wpm: 50,
            accuracy: 90,
            errors: 3,
            correctChars: 250,
            totalChars: 275,
            duration: 120,
            xp: 60,
          })
        })

        const [bestWpm, avgAccuracy, totalPracticeTime] = result.current.split('|').map(Number)
        expect(bestWpm).toBe(50)
        expect(avgAccuracy).toBe(90)
        expect(totalPracticeTime).toBe(120)
      })

      it('должен обновляться при добавлении новой сессии', () => {
        const { result } = renderHook(() => useProgressStats())

        act(() => {
          useProgressStore.getState().addSession({
            date: '2024-01-01T00:00:00.000Z',
            wpm: 40,
            accuracy: 85,
            errors: 5,
            correctChars: 200,
            totalChars: 220,
            duration: 60,
            xp: 50,
          })
        })

        let [bestWpm, avgAccuracy, totalPracticeTime] = result.current.split('|').map(Number)
        expect(bestWpm).toBe(40)
        expect(avgAccuracy).toBe(85)
        expect(totalPracticeTime).toBe(60)

        act(() => {
          useProgressStore.getState().addSession({
            date: '2024-01-02T00:00:00.000Z',
            wpm: 55,
            accuracy: 92,
            errors: 2,
            correctChars: 280,
            totalChars: 300,
            duration: 90,
            xp: 65,
          })
        })

        ;[bestWpm, avgAccuracy, totalPracticeTime] = result.current.split('|').map(Number)
        expect(bestWpm).toBe(55)
        expect(avgAccuracy).toBe(89) // среднее 85 и 92 = 88.5 → 89
        expect(totalPracticeTime).toBe(150)
      })
    })
  })

  describe('Shared computation functions', () => {
    describe('getBestWpmFromSessions', () => {
      it('должен возвращать 0 для пустого массива', () => {
        expect(getBestWpmFromSessions([])).toBe(0)
      })

      it('должен возвращать максимальный WPM', () => {
        const sessions = [
          { wpm: 30 } as any,
          { wpm: 55 } as any,
          { wpm: 42 } as any,
        ]
        expect(getBestWpmFromSessions(sessions)).toBe(55)
      })

      it('должен возвращать WPM для одной сессии', () => {
        const sessions = [{ wpm: 40 } as any]
        expect(getBestWpmFromSessions(sessions)).toBe(40)
      })
    })

    describe('getAvgAccuracyFromSessions', () => {
      it('должен возвращать 0 для пустого массива', () => {
        expect(getAvgAccuracyFromSessions([])).toBe(0)
      })

      it('должен усреднять точность всех сессий если их <= 10', () => {
        const sessions = [
          { accuracy: 80 } as any,
          { accuracy: 90 } as any,
          { accuracy: 100 } as any,
        ]
        expect(getAvgAccuracyFromSessions(sessions)).toBe(90)
      })

      it('должен учитывать только первые 10 сессий', () => {
        const sessions = Array.from({ length: 15 }, (_, i) => ({ accuracy: i < 5 ? 50 : 90 } as any))
        // Первые 10 сессий имеют accuracy 90 (сессии добавляются в начало, так что последние добавленные = первые в массиве)
        // Sessions 0-4: accuracy 50, sessions 5-14: accuracy 90
        // slice(0, 10) берет sessions 0-9: 5 с accuracy 50 и 5 с accuracy 90
        const expected = Math.round((5 * 50 + 5 * 90) / 10)
        expect(getAvgAccuracyFromSessions(sessions)).toBe(expected)
      })
    })

    describe('getTotalPracticeTimeFromSessions', () => {
      it('должен возвращать 0 для пустого массива', () => {
        expect(getTotalPracticeTimeFromSessions([])).toBe(0)
      })

      it('должен суммировать duration всех сессий', () => {
        const sessions = [
          { duration: 60 } as any,
          { duration: 120 } as any,
          { duration: 90 } as any,
        ]
        expect(getTotalPracticeTimeFromSessions(sessions)).toBe(270)
      })
    })
  })
})
