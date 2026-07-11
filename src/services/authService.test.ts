import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { authService, hashPassword } from './authService'
import { AuthError } from './authErrors'
import { STORAGE_KEYS } from '../constants/storageKeys'

// Mock supabase to be null so authService falls through to localStorage path
vi.mock('./supabase', () => ({ supabase: null }))

const store = new Map<string, string>()

function createMockStorage(): Storage {
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { store.set(key, value) }),
    removeItem: vi.fn((key: string) => { store.delete(key) }),
    clear: vi.fn(() => { store.clear() }),
    key: vi.fn((index: number) => [...store.keys()][index] ?? null),
    get length() { return store.size },
  } satisfies Storage as unknown as Storage
}

function setupCryptoMock() {
  const subtleDigest = vi.fn(async (_algorithm: string, data: ArrayBuffer) => {
    const bytes = new Uint8Array(data)
    const result = new Uint8Array(32)
    for (let i = 0; i < 32; i++) {
      result[i] = bytes[i % (bytes.length || 1)] + i
    }
    return result.buffer as ArrayBuffer
  })
  const getRandomValues = vi.fn((arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) arr[i] = (i * 17 + 31) % 256
    return arr
  })
  Object.defineProperty(globalThis, 'crypto', {
    value: { getRandomValues, subtle: { digest: subtleDigest } },
    writable: true,
    configurable: true,
  })
}

const validUser = {
  email: 'test@example.com',
  password: 'StrongPass1!',
  confirmPassword: 'StrongPass1!',
  name: 'Test User',
  agreeToTerms: true,
}

beforeEach(() => {
  store.clear()
  setupCryptoMock()
  Object.defineProperty(globalThis, 'localStorage', {
    value: createMockStorage(),
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('authService', () => {
  describe('init', () => {
    it('should run without errors', () => {
      expect(() => authService.init()).not.toThrow()
    })

    it('should cleanup expired reset tokens', () => {
      localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify([
        { email: 'old@test.com', token: 'XYZ', expiresAt: new Date(Date.now() - 100000).toISOString() },
      ]))
      authService.init()
      const tokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESET_TOKENS) ?? '[]')
      expect(tokens).toHaveLength(0)
    })
  })

  describe('hashPassword', () => {
    it('should return a hex string', async () => {
      const hash = await hashPassword('test', 'salt')
      expect(hash).toEqual(expect.any(String))
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should produce different hashes for different salts', async () => {
      const hash1 = await hashPassword('password', 'salt1')
      const hash2 = await hashPassword('password', 'salt2')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('register', () => {
    it('should register a new user', async () => {
      const user = await authService.register(validUser)
      expect(user.email).toBe('test@example.com')
      expect(user.name).toBe('Test User')
      expect(user.role).toBe('admin')
      expect(user.stats.totalXp).toBe(0)
    })

    it('should reject invalid email', async () => {
      await expect(authService.register({ ...validUser, email: 'invalid' })).rejects.toThrow(AuthError)
    })

    it('should reject weak password', async () => {
      await expect(authService.register({ ...validUser, password: 'short', confirmPassword: 'short' })).rejects.toThrow(AuthError)
    })

    it('should reject password mismatch', async () => {
      await expect(authService.register({ ...validUser, confirmPassword: 'Different1!' })).rejects.toThrow(AuthError)
    })

    it('should reject unaccepted terms', async () => {
      await expect(authService.register({ ...validUser, agreeToTerms: false })).rejects.toThrow(AuthError)
    })

    it('should reject duplicate email', async () => {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([
        { id: '1', email: 'test@example.com', name: 'Existing', password: 'hash', salt: 'salt', role: 'user', createdAt: new Date().toISOString(), stats: {} },
      ]))
      await expect(authService.register(validUser)).rejects.toThrow(AuthError)
    })

    it('should save user to localStorage', async () => {
      await authService.register(validUser)
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) ?? '[]')
      expect(users).toHaveLength(1)
      expect(users[0].email).toBe('test@example.com')
    })

    it('should make the first user an admin', async () => {
      const user = await authService.register(validUser)
      expect(user.role).toBe('admin')
    })

    it('should make subsequent users regular users', async () => {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([
        { id: 'admin-id', email: 'admin@test.com', name: 'Admin', password: 'hash', salt: 'salt', role: 'admin', createdAt: new Date(Date.now() - 100000).toISOString(), stats: {} },
      ]))
      const user = await authService.register(validUser)
      expect(user.role).toBe('user')
    })
  })

  describe('login', () => {
    it('should login a registered user', async () => {
      await authService.register(validUser)
      const user = await authService.login({ email: 'test@example.com', password: 'StrongPass1!' })
      expect(user.email).toBe('test@example.com')
    })

    it('should reject invalid email format', async () => {
      await expect(authService.login({ email: 'invalid', password: 'StrongPass1!' })).rejects.toThrow(AuthError)
    })

    it('should reject non-existent user', async () => {
      await expect(authService.login({ email: 'noone@test.com', password: 'StrongPass1!' })).rejects.toThrow(AuthError)
    })

    it('should reject wrong password', async () => {
      await authService.register(validUser)
      await expect(authService.login({ email: 'test@example.com', password: 'WrongPass1!' })).rejects.toThrow(AuthError)
    })
  })

  describe('logout', () => {
    it('should remove current user from storage', async () => {
      await authService.register(validUser)
      expect(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)).toBeDefined()
      await authService.logout()
      expect(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should return null when no user is logged in', () => {
      expect(authService.getCurrentUser()).toBeNull()
    })

    it('should return the logged-in user', async () => {
      await authService.register(validUser)
      const user = authService.getCurrentUser()
      expect(user).not.toBeNull()
      expect(user?.email).toBe('test@example.com')
    })
  })

  describe('requestPasswordReset', () => {
    it('should generate a reset token', async () => {
      await authService.register(validUser)
      const result = await authService.requestPasswordReset({ email: 'test@example.com' })
      expect(result.token).toEqual(expect.any(String))
      expect(result.token.length).toBeGreaterThan(0)
      expect(result.expiresAt).toEqual(expect.any(String))
    })

    it('should reject invalid email', async () => {
      await expect(authService.requestPasswordReset({ email: 'invalid' })).rejects.toThrow(AuthError)
    })

    it('should reject non-existent user', async () => {
      await expect(authService.requestPasswordReset({ email: 'noone@test.com' })).rejects.toThrow(AuthError)
    })
  })

  describe('confirmPasswordReset', () => {
    it('should reset password with valid token', async () => {
      await authService.register(validUser)
      const { token } = await authService.requestPasswordReset({ email: 'test@example.com' })
      await authService.confirmPasswordReset({ token, newPassword: 'NewStrong1!', confirmPassword: 'NewStrong1!' })
      const user = await authService.login({ email: 'test@example.com', password: 'NewStrong1!' })
      expect(user.email).toBe('test@example.com')
    })

    it('should reject weak new password', async () => {
      await authService.register(validUser)
      const { token } = await authService.requestPasswordReset({ email: 'test@example.com' })
      await expect(authService.confirmPasswordReset({ token, newPassword: 'short', confirmPassword: 'short' })).rejects.toThrow(AuthError)
    })

    it('should reject password mismatch', async () => {
      await authService.register(validUser)
      const { token } = await authService.requestPasswordReset({ email: 'test@example.com' })
      await expect(authService.confirmPasswordReset({ token, newPassword: 'NewStrong1!', confirmPassword: 'DiffStrong1!' })).rejects.toThrow(AuthError)
    })

    it('should reject invalid token', async () => {
      await expect(authService.confirmPasswordReset({ token: 'INVALID', newPassword: 'NewStrong1!', confirmPassword: 'NewStrong1!' })).rejects.toThrow(AuthError)
    })
  })

  describe('updateProfile', () => {
    it('should update user name', async () => {
      const user = await authService.register(validUser)
      const updated = await authService.updateProfile(user.id, { name: 'Updated Name' })
      expect(updated.name).toBe('Updated Name')
    })

    it('should throw for non-existent user', async () => {
      await expect(authService.updateProfile('nonexistent-id', { name: 'New Name' })).rejects.toThrow(AuthError)
    })
  })

  describe('syncUserStats', () => {
    it('should update user stats', async () => {
      const user = await authService.register(validUser)
      const updated = await authService.syncUserStats(user.id, { totalXp: 100, level: 2 })
      expect(updated.stats.totalXp).toBe(100)
      expect(updated.stats.level).toBe(2)
    })

    it('should merge stats correctly', async () => {
      const user = await authService.register(validUser)
      const updated = await authService.syncUserStats(user.id, { bestWpm: 50 })
      expect(updated.stats.bestWpm).toBe(50)
      expect(updated.stats.totalXp).toBe(0)
    })

    it('should throw for non-existent user', async () => {
      await expect(authService.syncUserStats('nonexistent-id', { totalXp: 100 })).rejects.toThrow(AuthError)
    })
  })

  describe('changePassword', () => {
    it('should change password with correct current password', async () => {
      const user = await authService.register(validUser)
      await authService.changePassword(user.id, 'StrongPass1!', 'NewStrong1!')
      const loggedIn = await authService.login({ email: 'test@example.com', password: 'NewStrong1!' })
      expect(loggedIn.email).toBe('test@example.com')
    })

    it('should reject wrong current password', async () => {
      const user = await authService.register(validUser)
      await expect(authService.changePassword(user.id, 'WrongPass1!', 'NewStrong1!')).rejects.toThrow(AuthError)
    })
  })
})
