import { useState, useCallback } from 'react'

interface UseClipboardOptions {
  timeout?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface UseClipboardReturn {
  copied: boolean
  copy: (text: string) => Promise<void>
  reset: () => void
}

/**
 * Хук для работы с буфером обмена
 * 
 * @example
 * ```tsx
 * const { copied, copy, reset } = useClipboard({ timeout: 2000 })
 * 
 * <button onClick={() => copy('Текст для копирования')}>
 *   {copied ? 'Скопировано!' : 'Копировать'}
 * </button>
 * ```
 */
export function useClipboard({
  timeout = 2000,
  onSuccess,
  onError
}: UseClipboardOptions = {}): UseClipboardReturn {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    try {
      if (!navigator.clipboard) {
        // Fallback для старых браузеров
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        
        try {
          document.execCommand('copy')
          setCopied(true)
          onSuccess?.()
          
          setTimeout(() => setCopied(false), timeout)
        } catch {
          throw new Error('Failed to copy using execCommand')
        } finally {
          document.body.removeChild(textarea)
        }
        return
      }

      await navigator.clipboard.writeText(text)
      setCopied(true)
      onSuccess?.()
      
      setTimeout(() => setCopied(false), timeout)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown clipboard error')
      onError?.(err)
      throw err
    }
  }, [timeout, onSuccess, onError])

  const reset = useCallback(() => {
    setCopied(false)
  }, [])

  return { copied, copy, reset }
}
