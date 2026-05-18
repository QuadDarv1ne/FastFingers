import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useContext } from 'react'
import { AuthProvider, AuthContext } from '../contexts/AuthContext'
import type { User } from '../types/auth'

import * as authServiceModule from '../services/authService'

vi.mock('../services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    requestPasswordReset: vi.fn(),
    confirmPasswordReset: vi.fn(),
    syncUserStats: vi.fn(),
  },
}))

const mockAuthService = vi.mocked(authServiceModule.authService)

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: '2026-01-01T00:00:00Z',
    role: 'user',
    stats: {
      totalXp: 0,
      level: 1,
      bestWpm: 0,
      bestAccuracy: 100,
      totalWordsTyped: 0,
      totalPracticeTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      completedChallenges: 0,
    },
    ...overrides,
  }
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with no user and isLoading=false after mount', () => {
    mockAuthService.getCurrentUser.mockReturnValue(null)
    const { result } = renderHook(() => useAuthContext(), { wrapper })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('should initialize with user when getCurrentUser returns one', () => {
    const user = createMockUser()
    mockAuthService.getCurrentUser.mockReturnValue(user)

    const { result } = renderHook(() => useAuthContext(), { wrapper })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(user)
  })

  it('should login successfully', async () => {
    const user = createMockUser()
    mockAuthService.getCurrentUser.mockReturnValue(user)
    mockAuthService.login.mockResolvedValue(user)

    const { result } = renderHook(() => useAuthContext(), { wrapper })

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password123' })
    })

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should set error on login failure', async () => {
    mockAuthService.getCurrentUser.mockReturnValue(null)
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'))

    const { result } = renderHook(() => useAuthContext(), { wrapper })

    await act(async () => {
      try {
        await result.current.login({ email: 'wrong@example.com', password: 'wrong' })
      } catch {
        // expected
      }
    })

    expect(result.current.error).toBe('Invalid credentials')
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should logout and clear user', async () => {
    const user = createMockUser()
    mockAuthService.getCurrentUser.mockReturnValue(user)
    mockAuthService.logout.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuthContext(), { wrapper })

    expect(result.current.isAuthenticated).toBe(true)

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should clear error', async () => {
    mockAuthService.getCurrentUser.mockReturnValue(null)
    mockAuthService.login.mockRejectedValue(new Error('Login failed'))

    const { result } = renderHook(() => useAuthContext(), { wrapper })

    await act(async () => {
      try {
        await result.current.login({ email: 'test@example.com', password: 'pass' })
      } catch {
        // expected
      }
    })

    expect(result.current.error).toBe('Login failed')

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })

  it('should refresh user', async () => {
    const user = createMockUser()
    const updatedUser = createMockUser({ name: 'Updated Name' })

    mockAuthService.getCurrentUser.mockReturnValueOnce(user).mockReturnValue(updatedUser)

    const { result } = renderHook(() => useAuthContext(), { wrapper })

    expect(result.current.user?.name).toBe('Test User')

    await act(async () => {
      await result.current.refreshUser()
    })

    await waitFor(() => {
      expect(result.current.user?.name).toBe('Updated Name')
    })
  })

  it('should reset password', async () => {
    mockAuthService.getCurrentUser.mockReturnValue(null)
    mockAuthService.requestPasswordReset.mockResolvedValue({
      token: 'reset-token-123',
      expiresAt: '2026-01-02T00:00:00Z',
    })

    const { result } = renderHook(() => useAuthContext(), { wrapper })

    let tokenResult: { token: string; expiresAt: string } | undefined
    await act(async () => {
      tokenResult = await result.current.resetPassword({ email: 'test@example.com' })
    })

    expect(tokenResult).toEqual({
      token: 'reset-token-123',
      expiresAt: '2026-01-02T00:00:00Z',
    })
    expect(result.current.lastResetToken).toEqual({
      token: 'reset-token-123',
      expiresAt: '2026-01-02T00:00:00Z',
    })
  })

  it('should set isActionPending during login', async () => {
    const user = createMockUser()
    mockAuthService.getCurrentUser.mockReturnValue(user)
    let resolveLogin!: (value: User) => void
    mockAuthService.login.mockReturnValue(
      new Promise<User>(resolve => { resolveLogin = resolve })
    )

    const { result } = renderHook(() => useAuthContext(), { wrapper })

    act(() => {
      result.current.login({ email: 'test@example.com', password: 'pass123456' }).catch(() => {})
    })

    expect(result.current.isActionPending).toBe(true)

    await act(async () => {
      resolveLogin(user)
    })

    await waitFor(() => {
      expect(result.current.isActionPending).toBe(false)
    })
  })
})
