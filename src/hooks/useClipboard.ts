import { useState, useCallback, useRef, useEffect } from 'react'
import { logger } from '../utils/logger'

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

export function useClipboard({
  timeout = 2000,
  onSuccess,
  onError
}: UseClipboardOptions = {}): UseClipboardReturn {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const timeouts = timeoutRef.current
    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [])

  const scheduleReset = useCallback(() => {
    const id = setTimeout(() => setCopied(false), timeout)
    timeoutRef.current.push(id)
  }, [timeout])

  const copy = useCallback(async (text: string) => {
    try {
      if (!navigator.clipboard) {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        textarea.style.top = '0'
        textarea.style.opacity = '0'
        textarea.setAttribute('aria-hidden', 'true')
        document.body.appendChild(textarea)
        textarea.select()

        try {
          document.execCommand('copy')
          setCopied(true)
          onSuccess?.()
          scheduleReset()
        } catch {
          logger.warn('Operation failed in hooks/useClipboard.ts')
          throw new Error('Failed to copy using execCommand')
        } finally {
          document.body.removeChild(textarea)
        }
        return
      }

      await navigator.clipboard.writeText(text)
      setCopied(true)
      onSuccess?.()
      scheduleReset()
    } catch (error) {
      logger.warn('Operation failed in hooks/useClipboard.ts')
      const err = error instanceof Error ? error : new Error('Unknown clipboard error')
      onError?.(err)
      throw err
    }
  }, [onSuccess, onError, scheduleReset])

  const reset = useCallback(() => {
    setCopied(false)
  }, [])

  return { copied, copy, reset }
}

export default useClipboard
