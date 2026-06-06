import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TypingTrainer } from './TypingTrainer'

const mockT = vi.hoisted(() => (key: string) => key)
const mockI18n = vi.hoisted(() => ({ language: 'ru' }))
const mockLogger = vi.hoisted(() => ({ log: vi.fn(), warn: vi.fn(), error: vi.fn() }))
const mockAdaptive = vi.hoisted(() => ({
  isEnabled: false,
  level: 1,
  levelDescription: 'Beginner',
  levelBadge: '🌱',
  multiplier: 1,
  trend: 'stable' as const,
  state: { level: 1, history: [], trend: 'stable' as const },
  toggleEnabled: vi.fn(),
  reset: vi.fn(),
  onSessionComplete: vi.fn(),
  getNextText: vi.fn(() => null),
  getNextTextReason: '',
}))

vi.mock('../i18n/config', () => ({
  useAppTranslation: () => ({ t: mockT, i18n: mockI18n }),
}))

vi.mock('../utils/exercises', () => ({
  getRandomExercise: vi.fn(() => ({ text: 'hello world example text', category: 'words', difficulty: 5 })),
  generatePracticeText: vi.fn(() => 'quick brown fox jumps over'),
}))

vi.mock('../utils/stats', () => ({
  calculateStats: vi.fn(() => ({
    wpm: 60,
    accuracy: 100,
    cpm: 300,
    errors: 0,
    timeElapsed: 10,
  })),
}))

vi.mock('../hooks/useAdaptiveDifficulty', () => ({
  useAdaptiveDifficulty: () => mockAdaptive,
}))

vi.mock('../hooks/useTypingSound', () => ({
  useTypingSound: () => ({
    isEnabled: true,
    playCorrect: vi.fn(),
    playError: vi.fn(),
  }),
}))

vi.mock('../hooks/useFocusTrap', () => ({
  useFocusTrap: vi.fn(),
}))

vi.mock('../hooks/useHotkeys', () => ({
  useHotkey: vi.fn(),
}))

vi.mock('../utils/logger', () => ({
  createScopedLogger: () => mockLogger,
}))

vi.mock('./TypingChar', () => ({
  TypingChar: ({ char, status }: { char: string; status: string }) => (
    <span data-testid={`char-${status}`} data-char={char}>{char}</span>
  ),
}))

describe('TypingTrainer', () => {
  const defaultProps = {
    onSessionComplete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders category selector', () => {
    render(<TypingTrainer {...defaultProps} />)
    expect(screen.getByLabelText('trainer.aria.category')).toBeInTheDocument()
  })

  it('renders difficulty selector', () => {
    render(<TypingTrainer {...defaultProps} />)
    expect(screen.getByLabelText('trainer.aria.difficulty')).toBeInTheDocument()
  })

  it('renders adaptive difficulty section', () => {
    render(<TypingTrainer {...defaultProps} />)
    expect(screen.getByText('trainer.adaptation')).toBeInTheDocument()
  })

  it('renders restart button', () => {
    render(<TypingTrainer {...defaultProps} />)
    expect(screen.getByLabelText('action.restart')).toBeInTheDocument()
  })

  it('renders skip button', () => {
    render(<TypingTrainer {...defaultProps} />)
    expect(screen.getByLabelText('trainer.aria.skip')).toBeInTheDocument()
  })

  it('renders continue button when not complete', () => {
    render(<TypingTrainer {...defaultProps} />)
    expect(screen.getByLabelText('trainer.aria.nextExercise')).toBeInTheDocument()
  })

  it('disables category selector when isChallenge is true', () => {
    render(<TypingTrainer {...defaultProps} isChallenge={true} challengeText="test challenge text" />)
    expect(screen.getByLabelText('trainer.aria.category')).toBeDisabled()
  })

  it('shows custom exercise option when customExercises provided', () => {
    const customExercises = [{ id: '1', text: 'custom text', title: 'Custom Ex', category: 'custom' as const }]
    render(<TypingTrainer {...defaultProps} customExercises={customExercises} />)
    expect(screen.getByText(/✏️/)).toBeInTheDocument()
  })

  it('changes category when select changes', () => {
    render(<TypingTrainer {...defaultProps} />)
    const select = screen.getByLabelText('trainer.aria.category')
    fireEvent.change(select, { target: { value: 'basic' } })
    expect(select).toHaveValue('basic')
  })

  it('changes difficulty when select changes', () => {
    render(<TypingTrainer {...defaultProps} />)
    const select = screen.getByLabelText('trainer.aria.difficulty')
    fireEvent.change(select, { target: { value: '7' } })
    expect(select).toHaveValue('7')
  })

  it('renders hidden input for keyboard capture', () => {
    render(<TypingTrainer {...defaultProps} />)
    const hiddenInput = screen.getByLabelText('trainer.aria.inputField')
    expect(hiddenInput).toBeInTheDocument()
    expect(hiddenInput).toHaveAttribute('readonly')
  })

  it('renders progress section', () => {
    render(<TypingTrainer {...defaultProps} />)
    expect(screen.getByText('trainer.progressLabel')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('shows current key hint when not complete', () => {
    render(<TypingTrainer {...defaultProps} />)
    expect(screen.getByText(/trainer\.nextKey/)).toBeInTheDocument()
  })

  function typeAllChars(input: HTMLElement, text: string) {
    for (const char of text) {
      fireEvent.keyDown(input, {
        key: char === ' ' ? 'Enter' : char,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
      })
      vi.advanceTimersByTime(20)
    }
  }

  it('calls onSessionComplete when typing finishes', () => {
    const onComplete = vi.fn()
    render(<TypingTrainer {...defaultProps} onSessionComplete={onComplete} />)

    const input = screen.getByLabelText('trainer.aria.inputField')
    typeAllChars(input, 'quick brown fox jumps over')

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
      wpm: expect.any(Number),
      accuracy: expect.any(Number),
    }))
  })

  it('shows completion overlay on exercise finish', () => {
    render(<TypingTrainer {...defaultProps} />)

    const input = screen.getByLabelText('trainer.aria.inputField')
    typeAllChars(input, 'quick brown fox jumps over')

    // The completion overlay should contain the next exercise button
    expect(screen.getByLabelText('trainer.nextExercise')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('tracks correct and incorrect input', () => {
    const onKeyInput = vi.fn()
    render(<TypingTrainer {...defaultProps} onKeyInput={onKeyInput} />)

    const input = screen.getByLabelText('trainer.aria.inputField')

    // Type first char correctly ('q')
    fireEvent.keyDown(input, {
      key: 'q', ctrlKey: false, metaKey: false, altKey: false, shiftKey: false,
    })
    vi.advanceTimersByTime(20)
    expect(onKeyInput).toHaveBeenCalledWith('q', true)

    // Type second char incorrectly (should be 'u', type 'x')
    fireEvent.keyDown(input, {
      key: 'x', ctrlKey: false, metaKey: false, altKey: false, shiftKey: false,
    })
    vi.advanceTimersByTime(20)
    expect(onKeyInput).toHaveBeenCalledWith('u', false)
  })

  it('ignores modifier keys', () => {
    const onKeyInput = vi.fn()
    render(<TypingTrainer {...defaultProps} onKeyInput={onKeyInput} />)

    const input = screen.getByLabelText('trainer.aria.inputField')

    fireEvent.keyDown(input, { key: 'Shift', ctrlKey: false })
    fireEvent.keyDown(input, { key: 'q', ctrlKey: true })
    fireEvent.keyDown(input, { key: 'w', metaKey: true })
    fireEvent.keyDown(input, { key: 'e', altKey: true })

    expect(onKeyInput).not.toHaveBeenCalled()
  })

  it('ignores key repeat events', () => {
    const onKeyInput = vi.fn()
    render(<TypingTrainer {...defaultProps} onKeyInput={onKeyInput} />)

    const input = screen.getByLabelText('trainer.aria.inputField')

    fireEvent.keyDown(input, { key: 'q', ctrlKey: false, repeat: true })

    expect(onKeyInput).not.toHaveBeenCalled()
  })

  it('handles challenge mode with provided text', () => {
    const onComplete = vi.fn()
    render(
      <TypingTrainer
        onSessionComplete={onComplete}
        isChallenge={true}
        challengeText="challenge specific text"
      />
    )

    expect(screen.getByLabelText('trainer.aria.category')).toBeDisabled()

    const input = screen.getByLabelText('trainer.aria.inputField')
    typeAllChars(input, 'challenge specific text')

    expect(onComplete).toHaveBeenCalled()
  })

  it('restarts exercise on restart button click', () => {
    render(<TypingTrainer {...defaultProps} />)

    const input = screen.getByLabelText('trainer.aria.inputField')
    fireEvent.keyDown(input, { key: 'q', ctrlKey: false })

    fireEvent.click(screen.getByLabelText('action.restart'))

    // After restart, progress should reset
    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})
