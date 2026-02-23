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
    (e: KeyboardEvent) => {
      const keys = Array.isArray(key) ? key : [key]
      
      if (keys.includes(e.key)) {
        if (preventDefault) {
          e.preventDefault()
        }
        
        if (stopPropagation) {
          e.stopPropagation()
        }
        
        callbackRef.current(e)
      }
    },
    [key, preventDefault, stopPropagation]
  )

  useEffect(() => {
    target.addEventListener(event, handler)

    return () => {
      target.removeEventListener(event, handler)
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
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      pressedKeys.current.add(key)

      const needsCtrl = comboKeys.includes('ctrl') || comboKeys.includes('control')
      const needsShift = comboKeys.includes('shift')
      const needsAlt = comboKeys.includes('alt')
      const needsMeta = comboKeys.includes('meta') || comboKeys.includes('cmd')

      const hasCtrl = needsCtrl ? (e.ctrlKey || e.metaKey) : true
      const hasShift = needsShift ? e.shiftKey : true
      const hasAlt = needsAlt ? e.altKey : true
      const hasMeta = needsMeta ? (e.metaKey || e.ctrlKey) : true

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
        if (preventDefault) e.preventDefault()
        if (stopPropagation) e.stopPropagation()
        callback(e)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.key.toLowerCase())
    }

    target.addEventListener(event, handleKeyDown)
    target.addEventListener('keyup', handleKeyUp)

    return () => {
      target.removeEventListener(event, handleKeyDown)
      target.removeEventListener('keyup', handleKeyUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combo, callback, event, target, preventDefault, stopPropagation])
}
