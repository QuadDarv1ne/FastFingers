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

/**
 * Хук для отслеживания комбинаций клавиш
 */
export function useKeyCombo(
  combo: string,
  callback: (event: KeyboardEvent) => void,
  options: UseKeyPressOptions = {}
): void {
  const {
    event = 'keydown',
    target = window,
    preventDefault = true,
    stopPropagation = false,
  } = options

  const comboKeys = combo.toLowerCase().split('+').map(k => k.trim())

  const pressedKeys = useRef<Set<string>>(new Set())

  useEffect(() => {
    const handleKeyDown = (e: Event) => {
      const keyboardEvent = e as KeyboardEvent
      const key = keyboardEvent.key.toLowerCase()
      pressedKeys.current.add(key)

      const needsCtrl = comboKeys.includes('ctrl') || comboKeys.includes('control')
      const needsShift = comboKeys.includes('shift')
      const needsAlt = comboKeys.includes('alt')
      const needsMeta = comboKeys.includes('meta') || comboKeys.includes('cmd')

      const hasCtrl = needsCtrl ? (keyboardEvent.ctrlKey || keyboardEvent.metaKey) : true
      const hasShift = needsShift ? keyboardEvent.shiftKey : true
      const hasAlt = needsAlt ? keyboardEvent.altKey : true
      const hasMeta = needsMeta ? (keyboardEvent.metaKey || keyboardEvent.ctrlKey) : true

      const mainKey = comboKeys.find(
        k => !['ctrl', 'control', 'shift', 'alt', 'meta', 'cmd'].includes(k)
      )

      if (
        hasCtrl &&
        hasShift &&
        hasAlt &&
        hasMeta &&
        mainKey &&
        pressedKeys.current.has(mainKey)
      ) {
        if (preventDefault) keyboardEvent.preventDefault()
        if (stopPropagation) keyboardEvent.stopPropagation()
        callback(keyboardEvent)
      }
    }

    const handleKeyUp = (e: Event) => {
      const keyboardEvent = e as KeyboardEvent
      pressedKeys.current.delete(keyboardEvent.key.toLowerCase())
    }

    const targetElement = target as EventTarget
    targetElement.addEventListener(event, handleKeyDown)
    targetElement.addEventListener('keyup', handleKeyUp)

    return () => {
      targetElement.removeEventListener(event, handleKeyDown)
      targetElement.removeEventListener('keyup', handleKeyUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combo, callback, event, target, preventDefault, stopPropagation])
}
