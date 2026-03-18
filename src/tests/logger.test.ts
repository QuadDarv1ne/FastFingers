import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger, createScopedLogger, safeExecute } from '../utils/logger'

describe('logger', () => {
  const originalEnv = process.env.NODE_ENV
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  describe('logger methods', () => {
    it('should have all required methods', () => {
      expect(logger).toHaveProperty('log')
      expect(logger).toHaveProperty('warn')
      expect(logger).toHaveProperty('error')
      expect(logger).toHaveProperty('info')
      expect(logger).toHaveProperty('debug')
    })

    it('should call console methods with correct arguments', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      
      logger.log('test message')
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should call console.warn for warn method', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      logger.warn('warning message')
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should call console.error for error method', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      logger.error('error message')
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should call console.info for info method', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      
      logger.info('info message')
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should call console.info for debug method', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      
      logger.debug('debug message')
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('createScopedLogger', () => {
    it('should create logger with custom scope', () => {
      const scopedLogger = createScopedLogger('TestScope')
      
      expect(scopedLogger).toHaveProperty('log')
      expect(scopedLogger).toHaveProperty('warn')
      expect(scopedLogger).toHaveProperty('error')
      expect(scopedLogger).toHaveProperty('info')
      expect(scopedLogger).toHaveProperty('debug')
    })

    it('should use scoped prefix in logs', () => {
      const scopedLogger = createScopedLogger('MyComponent')
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      
      scopedLogger.log('message')
      
      expect(consoleSpy).toHaveBeenCalledWith('[MyComponent]', 'message')
      consoleSpy.mockRestore()
    })

    it('should include emoji in warn scoped logs', () => {
      const scopedLogger = createScopedLogger('WarningScope')
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      scopedLogger.warn('warning')
      
      expect(consoleSpy).toHaveBeenCalledWith('[WarningScope] ⚠️', 'warning')
      consoleSpy.mockRestore()
    })

    it('should include emoji in error scoped logs', () => {
      const scopedLogger = createScopedLogger('ErrorScope')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      scopedLogger.error('error')
      
      expect(consoleSpy).toHaveBeenCalledWith('[ErrorScope] ❌', 'error')
      consoleSpy.mockRestore()
    })
  })

  describe('safeExecute', () => {
    it('should return function result on success', () => {
      const result = safeExecute(() => 42, 0, 'Error occurred')
      
      expect(result).toBe(42)
    })

    it('should return fallback on error', () => {
      const result = safeExecute(() => { throw new Error('Test error') }, 'fallback', 'Error occurred')
      
      expect(result).toBe('fallback')
    })

    it('should use default fallback when not specified', () => {
      const result = safeExecute(() => { throw new Error('Test error') }, null, 'Error occurred')
      
      expect(result).toBeNull()
    })

    it('should call logger.error on error', () => {
      const loggerSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      safeExecute(() => { throw new Error('Test error') }, null, 'Custom error message')
      
      expect(loggerSpy).toHaveBeenCalled()
      loggerSpy.mockRestore()
    })

    it('should handle complex return types', () => {
      const obj = { a: 1, b: { c: 2 } }
      const result = safeExecute(() => obj, { a: 0, b: { c: 0 } }, 'Error')
      
      expect(result).toEqual(obj)
    })

    it('should handle undefined as valid return', () => {
      const result = safeExecute(() => undefined, 'fallback', 'Error')
      
      expect(result).toBeUndefined()
    })
  })
})
