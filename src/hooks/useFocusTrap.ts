import { useEffect, useRef, RefObject } from 'react'

let trapCount = 0
let savedOverflow: string | null = null

function lockBodyScroll(): () => void {
  if (trapCount === 0) {
    savedOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  trapCount++

  return () => {
    trapCount--
    if (trapCount === 0) {
      document.body.style.overflow = savedOverflow ?? ''
      savedOverflow = null
    }
  }
}

/**
 * Хук для создания фокус-ловушки в модальных окнах и диалогах
 * Удерживает фокус внутри элемента, пока он активен
 *
 * @param ref - Ref на элемент-контейнер
 * @param isActive - Флаг активности ловушки
 */
export function useFocusTrap(ref: RefObject<HTMLElement>, isActive: boolean): void {
  const previousActiveElement = useRef<Element | null>(null)

  useEffect(() => {
    if (!isActive || !ref.current) return

    const unlock = lockBodyScroll()
    previousActiveElement.current = document.activeElement

    // Находим все фокусируемые элементы внутри контейнера
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      '[role="button"]',
      '[role="link"]',
      '[role="tab"]',
    ].join(', ')

    const container = ref.current
    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter(el => {
      const style = window.getComputedStyle(el)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })

    if (focusableElements.length === 0) {
      container.setAttribute('tabindex', '-1')
      container.focus()
      return () => {
        unlock()
        if (previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus()
        }
      }
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    firstElement?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      unlock()
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus()
      }
    }
  }, [isActive, ref])
}
