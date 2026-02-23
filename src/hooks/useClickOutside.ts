import { useEffect } from 'react'
import { RefObject } from 'react'

type Handler = (event: MouseEvent | TouchEvent) => void

/**
 * Хук для отслеживания кликов вне элемента
 * @param ref - Ref элемента
 * @param handler - Функция обратного вызова
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current
      
      // Если клик внутри элемента или элемента нет - игнорируем
      if (!el || el.contains(event.target as Node)) {
        return
      }

      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

/**
 * Хук для отслеживания кликов внутри элемента
 * @param ref - Ref элемента
 * @param handler - Функция обратного вызова
 */
export function useClickInside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current
      
      // Если клик вне элемента или элемента нет - игнорируем
      if (!el || !el.contains(event.target as Node)) {
        return
      }

      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}
