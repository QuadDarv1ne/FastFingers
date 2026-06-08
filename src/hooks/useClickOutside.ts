import { useEffect, useRef, type RefObject } from 'react'

type Handler = (event: MouseEvent | TouchEvent) => void

interface ClickOptions {
  mouseEvent?: 'mousedown' | 'click'
  touchEvent?: 'touchstart' | 'touchend'
}

const DEFAULT_OPTIONS: Required<ClickOptions> = {
  mouseEvent: 'click',
  touchEvent: 'touchstart',
}

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  options: ClickOptions = DEFAULT_OPTIONS
): void {
  const { mouseEvent, touchEvent } = { ...DEFAULT_OPTIONS, ...options }
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref?.current || ref.current.contains(event.target as Node)) {
        return
      }
      handlerRef.current(event)
    }

    document.addEventListener(mouseEvent, listener)
    document.addEventListener(touchEvent, listener)

    return () => {
      document.removeEventListener(mouseEvent, listener)
      document.removeEventListener(touchEvent, listener)
    }
  }, [ref, mouseEvent, touchEvent])
}

export function useClickInside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  options: ClickOptions = DEFAULT_OPTIONS
): void {
  const { mouseEvent, touchEvent } = { ...DEFAULT_OPTIONS, ...options }
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref?.current || !ref.current.contains(event.target as Node)) {
        return
      }
      handlerRef.current(event)
    }

    document.addEventListener(mouseEvent, listener)
    document.addEventListener(touchEvent, listener)

    return () => {
      document.removeEventListener(mouseEvent, listener)
      document.removeEventListener(touchEvent, listener)
    }
  }, [ref, mouseEvent, touchEvent])
}
