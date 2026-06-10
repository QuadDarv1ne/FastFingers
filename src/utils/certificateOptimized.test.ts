/**
 * Tests for certificateOptimized
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { User } from '../types/auth'
import { calculateRank } from '../utils/certificateTypes'

describe('certificateOptimized', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('calculateRank', () => {
    it('should return Bronze for low scores', () => {
      expect(calculateRank(20, 80)).toBe('Bronze')
      expect(calculateRank(25, 90)).toBe('Bronze')
    })

    it('should return Silver for medium scores', () => {
      expect(calculateRank(35, 90)).toBe('Silver')
      expect(calculateRank(40, 85)).toBe('Silver')
    })

    it('should return Gold for good scores', () => {
      expect(calculateRank(50, 95)).toBe('Gold')
      expect(calculateRank(60, 90)).toBe('Gold')
    })

    it('should return Platinum for high scores', () => {
      expect(calculateRank(65, 95)).toBe('Platinum')
      expect(calculateRank(70, 90)).toBe('Platinum')
    })

    it('should return Diamond for very high scores', () => {
      expect(calculateRank(85, 95)).toBe('Diamond')
      expect(calculateRank(90, 92)).toBe('Diamond')
    })

    it('should return Master for excellent scores', () => {
      expect(calculateRank(105, 96)).toBe('Master')
      expect(calculateRank(120, 90)).toBe('Master')
    })

    it('should handle edge cases', () => {
      expect(calculateRank(0, 0)).toBe('Bronze')
      expect(calculateRank(100, 100)).toBe('Master')
    })
  })

  describe('generateCertificate', () => {
    it('should create certificate blob', async () => {
      const mockCanvas = {
        width: 1200,
        height: 850,
        getContext: vi.fn().mockReturnValue({
          fillStyle: '',
          fillRect: vi.fn(),
          strokeStyle: '',
          strokeRect: vi.fn(),
          lineWidth: 0,
          textAlign: 'center',
          font: '',
          fillText: vi.fn(),
          createLinearGradient: vi.fn().mockReturnValue({
            addColorStop: vi.fn(),
          }),
          rect: vi.fn(),
          measureText: vi.fn().mockReturnValue({ width: 100 }),
          getImageData: vi.fn(),
          putImageData: vi.fn(),
          setLineDash: vi.fn(),
          lineTo: vi.fn(),
          moveTo: vi.fn(),
          stroke: vi.fn(),
          arc: vi.fn(),
          beginPath: vi.fn(),
          closePath: vi.fn(),
          clip: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          scale: vi.fn(),
          rotate: vi.fn(),
          translate: vi.fn(),
          transform: vi.fn(),
          setTransform: vi.fn(),
          clearRect: vi.fn(),
          drawImage: vi.fn(),
          createPattern: vi.fn(),
          createImageData: vi.fn(),
          isPointInPath: vi.fn(),
          isPointInStroke: vi.fn(),
        }),
        toBlob: vi.fn((callback: (blob: Blob) => void) => {
          callback(new Blob(['test'], { type: 'image/png' }))
        }),
      } as unknown as HTMLCanvasElement

      const createElementSpy = vi.spyOn(document, 'createElement')
      createElementSpy.mockReturnValue(mockCanvas)
      const { generateCertificate } = await import('../utils/certificateOptimized')
      const user: User = {
        name: 'Test User',
        email: 'test@example.com',
        id: 'test-id',
        createdAt: new Date().toISOString(),
        role: 'user' as const,
        stats: {
          totalXp: 0,
          level: 1,
          bestWpm: 0,
          bestAccuracy: 0,
          totalWordsTyped: 0,
          totalPracticeTime: 0,
          currentStreak: 0,
          longestStreak: 0,
          completedChallenges: 0,
        },
      }
      const result = await generateCertificate(
        {
          user,
          testType: 'sprint',
          wpm: 100,
          accuracy: 95,
          cpm: 300,
          date: new Date().toISOString(),
          rank: 'Gold',
        },
        { language: 'ru', download: false }
      )
      expect(result).toBeInstanceOf(Blob)
      expect(result.type).toBe('image/png')
      createElementSpy.mockRestore()
    })

    it('should handle different themes', async () => {
      const mockCanvas = {
        width: 1200,
        height: 850,
        getContext: vi.fn().mockReturnValue({
          fillStyle: '',
          fillRect: vi.fn(),
          strokeStyle: '',
          strokeRect: vi.fn(),
          lineWidth: 0,
          textAlign: 'center',
          font: '',
          fillText: vi.fn(),
          createLinearGradient: vi.fn().mockReturnValue({
            addColorStop: vi.fn(),
          }),
        }),
        toBlob: vi.fn((callback: (blob: Blob) => void) => {
          callback(new Blob(['test'], { type: 'image/png' }))
        }),
      } as unknown as HTMLCanvasElement

      const createElementSpy = vi.spyOn(document, 'createElement')
      createElementSpy.mockReturnValue(mockCanvas)
      const { generateCertificate } = await import('../utils/certificateOptimized')
      const user: User = {
        name: 'Test User',
        email: 'test@example.com',
        id: 'test-id',
        createdAt: new Date().toISOString(),
        role: 'user' as const,
        stats: {
          totalXp: 0,
          level: 1,
          bestWpm: 0,
          bestAccuracy: 0,
          totalWordsTyped: 0,
          totalPracticeTime: 0,
          currentStreak: 0,
          longestStreak: 0,
          completedChallenges: 0,
        },
      }

      await generateCertificate(
        {
          user,
          testType: 'sprint',
          wpm: 100,
          accuracy: 95,
          cpm: 300,
          date: new Date().toISOString(),
          rank: 'Gold',
        },
        { theme: 'neon', download: false }
      )

      await generateCertificate(
        {
          user,
          testType: 'sprint',
          wpm: 100,
          accuracy: 95,
          cpm: 300,
          date: new Date().toISOString(),
          rank: 'Gold',
        },
        { theme: 'modern', download: false }
      )

      await generateCertificate(
        {
          user,
          testType: 'sprint',
          wpm: 100,
          accuracy: 95,
          cpm: 300,
          date: new Date().toISOString(),
          rank: 'Gold',
        },
        { theme: 'classic', download: false }
      )

      createElementSpy.mockRestore()
    })
  })
})
