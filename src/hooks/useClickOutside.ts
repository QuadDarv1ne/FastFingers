import { useEffect } from 'react'
import { RefObject } from 'react'

type Handler = (event: MouseEvent | TouchEvent) => void

interface ClickOptions {
  mouseEvent?: 'mousedown' | 'click'
  touchEvent?: 'touchstart' | 'touchend'
}

const DEFAULT_OPTIONS: Required<ClickOptions> = {
  mouseEvent: 'mousedown',
  touchEvent: 'touchstart',
}

/**
 * Хук для отслеживания кликов вне элемента
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  options: ClickOptions = DEFAULT_OPTIONS
): void {
  const { mouseEvent, touchEvent } = { ...DEFAULT_OPTIONS, ...options }

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref?.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }

    document.addEventListener(mouseEvent, listener)
    document.addEventListener(touchEvent, listener)

    return () => {
      document.removeEventListener(mouseEvent, listener)
      document.removeEventListener(touchEvent, listener)
    }
  }, [ref, handler, mouseEvent, touchEvent])
}

/**
 * Хук для отслеживания кликов внутри элемента
 */
export function useClickInside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  options: ClickOptions = DEFAULT_OPTIONS
): void {
  const { mouseEvent, touchEvent } = { ...DEFAULT_OPTIONS, ...options }

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref?.current || !ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }

    document.addEventListener(mouseEvent, listener)
    document.addEventListener(touchEvent, listener)

    return () => {
      document.removeEventListener(mouseEvent, listener)
      document.removeEventListener(touchEvent, listener)
    }
  }, [ref, handler, mouseEvent, touchEvent])
}
