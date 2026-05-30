import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SprintMode } from '../components/SprintMode'

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
}))

vi.mock('@contexts/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}))

vi.mock('@hooks/useTypingGame', () => ({
  useTypingGame: () => ({
    text: 'hello world',
    currentIndex: 0,
    inputResults: [],
    isActive: false,
    wpm: 0,
    accuracy: 100,
    timeLeft: 60,
    inputRef: { current: null },
    handleInput: vi.fn(),
    handleSkip: vi.fn(),
    handleStart: vi.fn(),
  }),
}))

vi.mock('@hooks/useCountdown', () => ({
  useCountdown: () => ({
    countdown: null,
    start: vi.fn(),
  }),
}))

vi.mock('@hooks/useHotkeys', () => ({
  useHotkey: vi.fn(),
}))

vi.mock('@hooks/useTypingSound', () => ({
  useTypingSound: () => ({ playKeySound: vi.fn(), playErrorSound: vi.fn() }),
}))

describe('SprintMode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const defaultProps = {
    duration: 60,
    onExit: vi.fn(),
    onComplete: vi.fn(),
  }

  it('рендерит заголовок режима спринта', () => {
    render(<SprintMode {...defaultProps} />)
    expect(screen.getByText('Спринт')).toBeInTheDocument()
  })

  it('показывает кнопку старта когда игра не активна', () => {
    render(<SprintMode {...defaultProps} />)
    expect(screen.getAllByRole('button', { name: 'Начать' })).toHaveLength(2)
  })

  it('показывает таймер с правильным временем', () => {
    render(<SprintMode {...defaultProps} />)
    expect(screen.getByText('60s')).toBeInTheDocument()
  })

  it('показывает WPM значение', () => {
    render(<SprintMode {...defaultProps} />)
    const wpmSection = screen.getByText('WPM')
    expect(wpmSection).toBeInTheDocument()
    expect(wpmSection.closest('div')).toHaveTextContent('0')
  })

  it('показывает точность 100%', () => {
    render(<SprintMode {...defaultProps} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('имеет кнопку выхода с aria-label', () => {
    render(<SprintMode {...defaultProps} />)
    const exitButton = screen.getByRole('button', { name: 'Выйти' })
    expect(exitButton).toBeInTheDocument()
  })

  it('вызывает onExit при клике на кнопку выхода', () => {
    const onExit = vi.fn()
    render(<SprintMode {...defaultProps} onExit={onExit} />)
    screen.getByRole('button', { name: 'Выйти' }).click()
    expect(onExit).toHaveBeenCalled()
  })

  it('рендерит текст для набора', () => {
    render(<SprintMode {...defaultProps} />)
    expect(screen.getByText('h')).toBeInTheDocument()
    expect(screen.getByText('e')).toBeInTheDocument()
  })

  it('имеет region для статистики', () => {
    render(<SprintMode {...defaultProps} />)
    const region = screen.getByRole('region')
    expect(region).toBeInTheDocument()
  })
})
