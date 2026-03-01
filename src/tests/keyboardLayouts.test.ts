import { describe, it, expect } from 'vitest'
import {
  getKeyInfo,
  getKeysForFinger,
  getKeyColor,
  FINGER_COLORS,
} from '@utils/keyboardLayouts'
import { FingerZone } from '@/types'

describe('Keyboard Layouts Utils', () => {
  describe('getKeyInfo', () => {
    it('should return key info for JCUKEN layout', () => {
      const keyInfo = getKeyInfo('а', 'jcuken')
      expect(keyInfo).toBeDefined()
      expect(keyInfo?.key).toBe('а')
      expect(keyInfo?.finger).toBe('left-index')
      expect(keyInfo?.difficulty).toBe('easy')
    })

    it('should return key info for QWERTY layout', () => {
      const keyInfo = getKeyInfo('f', 'qwerty')
      expect(keyInfo).toBeDefined()
      expect(keyInfo?.key).toBe('f')
      expect(keyInfo?.finger).toBe('left-index')
      expect(keyInfo?.difficulty).toBe('easy')
    })

    it('should be case insensitive', () => {
      const lowerCase = getKeyInfo('a', 'qwerty')
      const upperCase = getKeyInfo('A', 'qwerty')
      expect(lowerCase).toEqual(upperCase)
    })

    it('should return undefined for non-existent key', () => {
      const keyInfo = getKeyInfo('🚀', 'qwerty')
      expect(keyInfo).toBeUndefined()
    })

    it('should identify space bar', () => {
      const keyInfo = getKeyInfo(' ', 'qwerty')
      expect(keyInfo).toBeDefined()
      expect(keyInfo?.finger).toBe('thumb')
      expect(keyInfo?.difficulty).toBe('easy')
    })
  })

  describe('getKeysForFinger', () => {
    it('should return all keys for left index finger in QWERTY', () => {
      const keys = getKeysForFinger('left-index', 'qwerty')
      expect(keys).toContain('f')
      expect(keys).toContain('g')
      expect(keys).toContain('r')
      expect(keys).toContain('t')
      expect(keys).toContain('v')
      expect(keys).toContain('b')
    })

    it('should return all keys for right pinky in JCUKEN', () => {
      const keys = getKeysForFinger('right-pinky', 'jcuken')
      expect(keys.length).toBeGreaterThan(0)
      expect(keys).toContain('з')
      expect(keys).toContain('ж')
    })

    it('should return space for thumb', () => {
      const keys = getKeysForFinger('thumb', 'qwerty')
      expect(keys).toContain(' ')
      expect(keys.length).toBe(1)
    })

    it('should return empty array for invalid finger', () => {
      const keys = getKeysForFinger('invalid-finger' as FingerZone, 'qwerty')
      expect(keys).toEqual([])
    })
  })

  describe('getKeyColor', () => {
    it('should return correct color for left pinky', () => {
      const color = getKeyColor('a', 'qwerty')
      expect(color).toBe(FINGER_COLORS['left-pinky'])
    })

    it('should return correct color for right index', () => {
      const color = getKeyColor('j', 'qwerty')
      expect(color).toBe(FINGER_COLORS['right-index'])
    })

    it('should return correct color for thumb (space)', () => {
      const color = getKeyColor(' ', 'qwerty')
      expect(color).toBe(FINGER_COLORS['thumb'])
    })

    it('should return default color for unknown key', () => {
      const color = getKeyColor('🎮', 'qwerty')
      expect(color).toBe('#6b7280')
    })

    it('should work with JCUKEN layout', () => {
      const color = getKeyColor('ф', 'jcuken')
      expect(color).toBe(FINGER_COLORS['left-pinky'])
    })
  })

  describe('FINGER_COLORS', () => {
    it('should have colors for all finger zones', () => {
      expect(FINGER_COLORS['left-pinky']).toBeDefined()
      expect(FINGER_COLORS['left-ring']).toBeDefined()
      expect(FINGER_COLORS['left-middle']).toBeDefined()
      expect(FINGER_COLORS['left-index']).toBeDefined()
      expect(FINGER_COLORS['right-index']).toBeDefined()
      expect(FINGER_COLORS['right-middle']).toBeDefined()
      expect(FINGER_COLORS['right-ring']).toBeDefined()
      expect(FINGER_COLORS['right-pinky']).toBeDefined()
      expect(FINGER_COLORS['thumb']).toBeDefined()
    })

    it('should use valid hex colors', () => {
      Object.values(FINGER_COLORS).forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })
  })
})
