import { useState, useEffect, useCallback } from 'react'

interface DailyChallenge {
  id: string
  date: string
  text: string
  targetWpm: number
  targetAccuracy: number
  completed: boolean
  xpReward: number
}

interface StreakData {
  current: number
  longest: number
  lastPracticeDate: string | null
  practiceDates: string[]
}

interface ChallengeWithProgress extends DailyChallenge {
  userWpm?: number
  userAccuracy?: number
}

const STORAGE_KEY_CHALLENGES = 'fastfingers_challenges'
const STORAGE_KEY_STREAK = 'fastfingers_streak'

// Генерация ежедневного челленджа
function generateDailyChallenge(date: string): DailyChallenge {
  // Используем дату как seed для генерации одинакового челленджа для всех
  const seed = date.split('-').reduce((a, b) => a + parseInt(b), 0)
  
  const texts = [
    'Съешь ещё этих мягких французских булок да выпей чаю',
    'В чащах юга жил бы цитрус да но фальшивый экземпляр',
    'Широкая электрификация южных губерний даст мощный толчок подъёму сельского хозяйства',
    'Быстрая коричневая лиса перепрыгивает через ленивую собаку',
    'Съешь же ещё этих мягких французских булок да выпей чаю',
  ]
  
  const difficulties = [
    { wpm: 20, acc: 90 },
    { wpm: 30, acc: 92 },
    { wpm: 40, acc: 94 },
    { wpm: 50, acc: 95 },
    { wpm: 60, acc: 97 },
  ]
  
  const textIndex = seed % texts.length
  const diffIndex = (seed + date.length) % difficulties.length
  
  return {
    id: `challenge-${date}`,
    date,
    text: texts[textIndex],
    targetWpm: difficulties[diffIndex].wpm,
    targetAccuracy: difficulties[diffIndex].acc,
    completed: false,
    xpReward: 100 + (diffIndex * 50),
  }
}

// Получение текущей даты в формате YYYY-MM-DD
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

export function useDailyChallenges() {
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([])
  const [streak, setStreak] = useState<StreakData>({
    current: 0,
    longest: 0,
    lastPracticeDate: null,
    practiceDates: [],
  })

  // Загрузка данных при монтировании
  useEffect(() => {
    try {
      const storedChallenges = localStorage.getItem(STORAGE_KEY_CHALLENGES)
      const storedStreak = localStorage.getItem(STORAGE_KEY_STREAK)

      if (storedChallenges) {
        setChallenges(JSON.parse(storedChallenges))
      }

      if (storedStreak) {
        setStreak(JSON.parse(storedStreak))
      }
    } catch (e) {
      console.error('Failed to load challenges:', e)
    }
  }, [])

  // Проверка обновления стрика
  const checkStreak = useCallback((today: string) => {
    setStreak(prev => {
      const lastDate = prev.lastPracticeDate
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      let newCurrent = prev.current
      let newLongest = prev.longest
      let newDates = [...prev.practiceDates]

      if (!lastDate) {
        newCurrent = 1
        newDates = [today]
      } else if (lastDate === today) {
        return prev
      } else if (lastDate === yesterdayStr || lastDate > yesterdayStr) {
        newCurrent = prev.current + 1
        newDates = [...newDates, today]
      } else {
        newCurrent = 1
        newDates = [today]
      }

      newLongest = Math.max(newLongest, newCurrent)

      const newStreak = {
        ...prev,
        current: newCurrent,
        longest: newLongest,
        lastPracticeDate: today,
        practiceDates: newDates.slice(-365),
      }

      try {
        localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(newStreak))
      } catch (e) {
        console.error('Failed to save streak:', e)
      }

      return newStreak
    })
  }, [])

  // Проверка и создание челленджа на сегодня
  useEffect(() => {
    const today = getTodayDate()
    
    setChallenges(prev => {
      const todayChallenge = prev.find(c => c.date === today)

      if (todayChallenge) {
        return prev
      }

      const newChallenge = generateDailyChallenge(today)
      return [...prev, newChallenge].slice(-30)
    })

    checkStreak(today)
  }, [checkStreak])

  // Завершение челленджа
  const completeChallenge = useCallback((challengeId: string, wpm: number, accuracy: number) => {
    setChallenges(prev => {
      const updated = prev.map(c => {
        if (c.id === challengeId && !c.completed) {
          const isComplete = wpm >= c.targetWpm && accuracy >= c.targetAccuracy
          return {
            ...c,
            completed: isComplete,
            userWpm: wpm,
            userAccuracy: accuracy,
          }
        }
        return c
      })

      return updated
    })

    checkStreak(getTodayDate())
  }, [checkStreak])

  // Сохранение челленджей при изменении
  useEffect(() => {
    if (challenges.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_CHALLENGES, JSON.stringify(challenges))
      } catch (e) {
        console.error('Failed to save challenges:', e)
      }
    }
  }, [challenges])

  // Получение текущего челленджа
  const todayChallenge = challenges.find(c => c.date === getTodayDate())

  // Статистика челленджей
  const stats = {
    total: challenges.length,
    completed: challenges.filter(c => c.completed).length,
    completionRate: challenges.length > 0 
      ? Math.round((challenges.filter(c => c.completed).length / challenges.length) * 100) 
      : 0,
  }

  return {
    todayChallenge,
    challenges,
    streak,
    stats,
    completeChallenge,
  }
}
