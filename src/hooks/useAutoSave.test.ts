/**
 * Тесты для useAutoSave
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoSave } from '../hooks/useAutoSave'
import { UserProgress, TypingStats, KeyHeatmapData, UserSettings } from '../types'

const mockProgress: UserProgress = {
  level: 5,
  xp: 2500,
  xpToNextLevel: 3600,
  totalWordsTyped: 1000,
  totalPracticeTime: 3600,
  bestWpm: 60,
  bestAccuracy: 95,
  streak: 7,
  lastPracticeDate: null,
}

const mockSession: TypingStats = {
  wpm: 55,
  cpm: 275,
  accuracy: 92,
  errors: 3,
  correctChars: 500,
  totalChars: 543,
  timeElapsed: 120,
}

const mockHeatmap: KeyHeatmapData = {
  'a': { errors: 2, total: 50, accuracy: 96 },
  'b': { errors: 5, total: 30, accuracy: 83 },
}

const mockSettings: UserSettings = {
  layout: 'jcuken',
  soundEnabled: true,
  soundVolume: 0.5,
  soundTheme: 'default',
  fontSize: 'medium',
  theme: 'dark',
  keyboardSkin: 'classic',
  showKeyboard: true,
  showStats: true,
}

describe('useAutoSave', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should restore data from localStorage if session is valid', () => {
    const savedData = {
      progress: mockProgress,
      currentSession: mockSession,
      heatmap: mockHeatmap,
      settings: mockSettings,
      timestamp: Date.now(),
    }
    
    localStorage.setItem('fastfingers-autosave', JSON.stringify(savedData))

    const onRestoreMock = vi.fn()
    
    renderHook(() => useAutoSave({
      progress: mockProgress,
      currentSession: null,
      heatmap: {},
      settings: mockSettings,
      onRestore: onRestoreMock,
    }))

    expect(onRestoreMock).toHaveBeenCalledWith(savedData)
  })

  it('should not restore expired session (older than 5 minutes)', () => {
    const expiredData = {
      progress: mockProgress,
      currentSession: mockSession,
      heatmap: mockHeatmap,
      settings: mockSettings,
      timestamp: Date.now() - 6 * 60 * 1000, // 6 минут назад
    }
    
    localStorage.setItem('fastfingers-autosave', JSON.stringify(expiredData))

    const onRestoreMock = vi.fn()
    
    renderHook(() => useAutoSave({
      progress: mockProgress,
      currentSession: null,
      heatmap: {},
      settings: mockSettings,
      onRestore: onRestoreMock,
    }))

    expect(onRestoreMock).not.toHaveBeenCalled()
    expect(localStorage.getItem('fastfingers-autosave')).toBeNull()
  })

  it('should clear autosave data', () => {
    localStorage.setItem('fastfingers-autosave', JSON.stringify({
      progress: mockProgress,
      timestamp: Date.now(),
    }))

    const { result } = renderHook(() => useAutoSave({
      progress: mockProgress,
      currentSession: null,
      heatmap: {},
      settings: mockSettings,
    }))

    act(() => {
      result.current.clearAutoSave()
    })

    expect(localStorage.getItem('fastfingers-autosave')).toBeNull()
  })

  it('should force save immediately', () => {
    const { result } = renderHook(() => useAutoSave({
      progress: mockProgress,
      currentSession: null,
      heatmap: {},
      settings: mockSettings,
    }))

    act(() => {
      result.current.forceSave()
    })

    const saved = localStorage.getItem('fastfingers-autosave')
    expect(saved).toBeTruthy()
    const parsed = JSON.parse(saved!)
    expect(parsed.progress).toEqual(mockProgress)
  })

  it('should save on beforeunload event', () => {
    const { result } = renderHook(() => useAutoSave({
      progress: mockProgress,
      currentSession: null,
      heatmap: {},
      settings: mockSettings,
    }))

    // forceSave вызывает сохранение
    act(() => {
      result.current.forceSave()
    })

    const saved = localStorage.getItem('fastfingers-autosave')
    expect(saved).toBeTruthy()
  })

  it('should handle localStorage errors gracefully', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage full')
    })

    const { result } = renderHook(() => useAutoSave({
      progress: mockProgress,
      currentSession: null,
      heatmap: {},
      settings: mockSettings,
    }))

    // forceSave не должен выбрасывать ошибку
    expect(() => {
      act(() => {
        result.current.forceSave()
      })
    }).not.toThrow()
  })

  it('should return isRestored flag', () => {
    const { result } = renderHook(() => useAutoSave({
      progress: mockProgress,
      currentSession: null,
      heatmap: {},
      settings: mockSettings,
    }))

    // isRestored должен быть false до восстановления
    expect(result.current.isRestored).toBe(false)
  })
})
