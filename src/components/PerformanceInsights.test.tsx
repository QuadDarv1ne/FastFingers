/**
 * Tests for PerformanceInsights component
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PerformanceInsights, TimeOfDayAnalysis, GoalsProgress } from './PerformanceInsights'
import { TypingStats } from '../types'

const mockSessions = [
  { date: '2026-03-20T10:00:00Z', wpm: 50, accuracy: 95, cpm: 250, duration: 60 },
  { date: '2026-03-20T14:00:00Z', wpm: 55, accuracy: 92, cpm: 275, duration: 120 },
  { date: '2026-03-19T09:00:00Z', wpm: 48, accuracy: 90, cpm: 240, duration: 90 },
  { date: '2026-03-19T16:00:00Z', wpm: 52, accuracy: 88, cpm: 260, duration: 75 },
  { date: '2026-03-18T11:00:00Z', wpm: 45, accuracy: 85, cpm: 225, duration: 60 },
]

const mockBestStats: TypingStats = {
  wpm: 65,
  cpm: 325,
  accuracy: 98,
  errors: 2,
  correctChars: 500,
  totalChars: 510,
  timeElapsed: 300,
}

describe('PerformanceInsights', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('должен показывать сообщение о недостатке данных', () => {
    render(<PerformanceInsights sessions={[]} />)

    expect(screen.getByText(/Нужно больше данных/i)).toBeInTheDocument()
  })

  it('должен показывать инсайты для достаточного количества сессий', () => {
    render(<PerformanceInsights sessions={mockSessions} bestStats={mockBestStats} />)

    expect(screen.getByText(/Аналитика производительности/i)).toBeInTheDocument()
  })

  it.skip('должен определять прогресс WPM', () => {
    const improvingSessions = [
      ...mockSessions,
      { date: '2026-03-21T10:00:00Z', wpm: 70, accuracy: 96, cpm: 350, duration: 60 },
      { date: '2026-03-21T11:00:00Z', wpm: 72, accuracy: 97, cpm: 360, duration: 60 },
    ]

    render(<PerformanceInsights sessions={improvingSessions} bestStats={mockBestStats} />)

    expect(screen.getByText(/Отличный прогресс/i)).toBeInTheDocument()
  })

  it('должен показывать достижение мастерства точности', () => {
    const highAccuracySessions = [
      { date: '2026-03-20T10:00:00Z', wpm: 50, accuracy: 98, cpm: 250, duration: 60 },
      { date: '2026-03-20T11:00:00Z', wpm: 52, accuracy: 97, cpm: 260, duration: 60 },
      { date: '2026-03-20T12:00:00Z', wpm: 51, accuracy: 96, cpm: 255, duration: 60 },
    ]

    render(<PerformanceInsights sessions={highAccuracySessions} />)

    expect(screen.getByText(/Мастер точности/i)).toBeInTheDocument()
  })

  it('должен показывать предупреждение о низкой точности', () => {
    const lowAccuracySessions = [
      { date: '2026-03-20T10:00:00Z', wpm: 60, accuracy: 75, cpm: 300, duration: 60 },
      { date: '2026-03-20T11:00:00Z', wpm: 62, accuracy: 72, cpm: 310, duration: 60 },
      { date: '2026-03-20T12:00:00Z', wpm: 58, accuracy: 70, cpm: 290, duration: 60 },
    ]

    render(<PerformanceInsights sessions={lowAccuracySessions} />)

    expect(screen.getByText(/Работа над ошибками/i)).toBeInTheDocument()
  })
})

describe('TimeOfDayAnalysis', () => {
  it.skip('должен показывать анализ по времени суток', () => {
    render(<TimeOfDayAnalysis sessions={mockSessions} />)

    expect(screen.getByText(/Продуктивность по времени суток/i)).toBeInTheDocument()
  })

  it.skip('должен определять лучшее время суток', () => {
    const morningSessions = [
      { date: '2026-03-20T08:00:00Z', wpm: 70, accuracy: 95, cpm: 350, duration: 60 },
      { date: '2026-03-20T09:00:00Z', wpm: 72, accuracy: 96, cpm: 360, duration: 60 },
      { date: '2026-03-20T10:00:00Z', wpm: 68, accuracy: 94, cpm: 340, duration: 60 },
    ]

    const eveningSessions = [
      { date: '2026-03-20T19:00:00Z', wpm: 50, accuracy: 90, cpm: 250, duration: 60 },
      { date: '2026-03-20T20:00:00Z', wpm: 48, accuracy: 88, cpm: 240, duration: 60 },
    ]

    render(<TimeOfDayAnalysis sessions={[...morningSessions, ...eveningSessions]} />)

    expect(screen.getByText(/Утро/i)).toBeInTheDocument()
  })

  it.skip('должен показывать null при пустых сессиях', () => {
    const { container } = render(<TimeOfDayAnalysis sessions={[]} />)

    expect(container.firstChild).toBeNull()
  })
})

describe('GoalsProgress', () => {
  it.skip('должен показывать прогресс дневной цели', () => {
    render(
      <GoalsProgress
        dailyGoal={60}
        weeklyGoal={55}
        todayWpm={50}
        thisWeekAvgWpm={52}
      />
    )

    expect(screen.getByText(/Дневная цель/i)).toBeInTheDocument()
    expect(screen.getByText(/50 \/ 60 WPM/i)).toBeInTheDocument()
  })

  it('должен показывать прогресс недельной цели', () => {
    render(
      <GoalsProgress
        dailyGoal={60}
        weeklyGoal={55}
        todayWpm={50}
        thisWeekAvgWpm={52}
      />
    )

    expect(screen.getByText(/Недельная цель/i)).toBeInTheDocument()
    expect(screen.getByText(/52\.?\d* \/ 55 WPM/i)).toBeInTheDocument()
  })

  it('должен показывать достижение цели', () => {
    render(
      <GoalsProgress
        dailyGoal={50}
        weeklyGoal={50}
        todayWpm={55}
        thisWeekAvgWpm={52}
      />
    )

    expect(screen.getByText(/Цель достигнута/i)).toBeInTheDocument()
  })

  it('должен показывать достижение недельной цели', () => {
    render(
      <GoalsProgress
        dailyGoal={60}
        weeklyGoal={50}
        todayWpm={50}
        thisWeekAvgWpm={55}
      />
    )

    expect(screen.getByText(/Недельная цель выполнена/i)).toBeInTheDocument()
  })
})
