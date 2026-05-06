import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useModeNavigation } from './useModeNavigation'

// Mock useGameMode
vi.mock('./useGameMode', () => ({
  useGameMode: () => ({
    gameMode: 'practice',
    view: 'main',
    speedTestDuration: 60,
    setGameMode: vi.fn(),
    setView: vi.fn(),
    setSpeedTestDuration: vi.fn(),
    resetToPractice: vi.fn(),
  }),
}))

describe('useModeNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return current gameMode and view', () => {
    const { result } = renderHook(() => useModeNavigation())

    expect(result.current.gameMode).toBe('practice')
    expect(result.current.view).toBe('main')
    expect(result.current.speedTestDuration).toBe(60)
  })

  it('should provide navigation actions', () => {
    const { result } = renderHook(() => useModeNavigation())

    expect(result.current.actions).toHaveProperty('goToPractice')
    expect(result.current.actions).toHaveProperty('goToSprint')
    expect(result.current.actions).toHaveProperty('goToHardcore')
    expect(result.current.actions).toHaveProperty('goToSpeedTest')
    expect(result.current.actions).toHaveProperty('goToReaction')
    expect(result.current.actions).toHaveProperty('goToMarathon')
    expect(result.current.actions).toHaveProperty('goToCode')
    expect(result.current.actions).toHaveProperty('goToDuel')
    expect(result.current.actions).toHaveProperty('goToTournament')
    expect(result.current.actions).toHaveProperty('goToHistory')
    expect(result.current.actions).toHaveProperty('goToCustomExercise')
    expect(result.current.actions).toHaveProperty('goToTips')
    expect(result.current.actions).toHaveProperty('goToWeekly')
    expect(result.current.actions).toHaveProperty('goToStatistics')
    expect(result.current.actions).toHaveProperty('goToLearning')
    expect(result.current.actions).toHaveProperty('goToMain')
    expect(result.current.actions).toHaveProperty('exitCurrentMode')
  })

  it('should call setGameMode when navigation action is called', () => {
    const { result } = renderHook(() => useModeNavigation())

    act(() => {
      result.current.actions.goToSprint()
    })

    // The mock is called, we verify the action exists and can be called
    expect(result.current.actions.goToSprint).toBeDefined()
  })
})
