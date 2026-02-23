import { useEffect, useCallback } from 'react'

interface UseAccessibilityOptions {
  enabled?: boolean
  onEscape?: () => void
  onEnter?: () => void
}

/**
 * Хук для улучшения доступности приложения
 */
export function useAccessibility({
  enabled = true,
  onEscape,
  onEnter,
}: UseAccessibilityOptions = {}) {
  // Обработка клавиши Escape
  useEffect(() => {
    if (!enabled || !onEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [enabled, onEscape])

  // Обработка Enter
  useEffect(() => {
    if (!enabled || !onEnter) return

    const handleEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && event.target instanceof HTMLElement) {
        // Игнорируем Enter в textarea и input
        if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') {
          return
        }
        onEnter()
      }
    }

    document.addEventListener('keydown', handleEnter)
    return () => document.removeEventListener('keydown', handleEnter)
  }, [enabled, onEnter])

  // Управление фокусом для клавиши Tab
  const manageTabKey = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab') return

    // Находим все фокусируемые элементы
    const focusableElements = document.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Shift + Tab
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    }
    // Tab
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', manageTabKey)
    return () => document.removeEventListener('keydown', manageTabKey)
  }, [enabled, manageTabKey])

  // Установка фокуса на элемент по id
  const focusElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.focus()
      return true
    }
    return false
  }, [])

  // Объявление о изменениях для screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.getElementById('aria-announcer')
    if (announcer) {
      announcer.setAttribute('aria-live', priority)
      announcer.textContent = message
      // Очистка через 1 секунду
      setTimeout(() => {
        announcer.textContent = ''
      }, 1000)
    }
  }, [])

  return {
    focusElement,
    announce,
  }
}
