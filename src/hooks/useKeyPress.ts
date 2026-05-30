import { useEffect, useCallback, useRef } from 'react'

interface UseKeyPressOptions {
  event?: 'keydown' | 'keyup'
  target?: EventTarget
  preventDefault?: boolean
  stopPropagation?: boolean
}

/**
 * Хук для отслеживания нажатия клавиш
 * @param key - Клавиша или массив клавиш
 * @param callback - Функция обратного вызова
 * @param options - Опции
 */
export function useKeyPress(
  key: string | string[],
  callback: (event: KeyboardEvent) => void,
  options: UseKeyPressOptions = {}
): void {
  const {
    event = 'keydown',
    target = window,
    preventDefault = true,
    stopPropagation = false,
  } = options

  const callbackRef = useRef(callback)

  // Обновляем ref при изменении callback
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const handler = useCallback(
    (e: Event) => {
      const keyboardEvent = e as KeyboardEvent
      const keys = Array.isArray(key) ? key : [key]

      if (keys.includes(keyboardEvent.key)) {
        if (preventDefault) {
          keyboardEvent.preventDefault()
        }

        if (stopPropagation) {
          keyboardEvent.stopPropagation()
        }

        callbackRef.current(keyboardEvent)
      }
    },
    [key, preventDefault, stopPropagation]
  )

  useEffect(() => {
    const targetElement = target as EventTarget
    targetElement.addEventListener(event, handler)

    return () => {
      targetElement.removeEventListener(event, handler)
    }
  }, [event, target, handler])
}
