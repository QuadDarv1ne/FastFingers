import { useEffect, useCallback, useRef, useState } from 'react'

interface HotkeyOptions {
  enabled?: boolean
  ignoreInputFocus?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
}

interface HotkeyRegistry {
  combination: string
  handler: (e: KeyboardEvent) => void
  options?: HotkeyOptions
}

const hotkeyRegistry = new Map<string, HotkeyRegistry>()

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/key|digit|numpad/g, '')
}

function getEventModifiers(e: KeyboardEvent): string[] {
  const modifiers: string[] = []
  if (e.ctrlKey || e.metaKey) modifiers.push('ctrl')
  if (e.shiftKey) modifiers.push('shift')
  if (e.altKey) modifiers.push('alt')
  return modifiers
}

function parseHotkey(hotkey: string): { modifiers: string[]; key: string } {
  const parts = hotkey.toLowerCase().split('+')
  const key = parts.pop() || ''
  const modifiers = parts.sort()
  return { modifiers, key: normalizeKey(key) }
}

function matchesHotkey(event: KeyboardEvent, hotkey: string): boolean {
  const { modifiers, key } = parseHotkey(hotkey)
  const eventModifiers = getEventModifiers(event)
  const eventKey = normalizeKey(event.key)
  
  if (modifiers.length !== eventModifiers.length) return false
  if (!modifiers.every(m => eventModifiers.includes(m))) return false
  return eventKey === key
}

export function useHotkeys(
  shortcuts: Record<string, (e: KeyboardEvent) => void>,
  options: HotkeyOptions = {}
) {
  const { 
    enabled = true, 
    ignoreInputFocus = true,
    preventDefault = true,
    stopPropagation = false
  } = options
  
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    if (ignoreInputFocus) {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || 
          (target as HTMLElement).isContentEditable) {
        return
      }
    }

    const parts = []
    if (event.ctrlKey || event.metaKey) parts.push('ctrl')
    if (event.shiftKey) parts.push('shift')
    if (event.altKey) parts.push('alt')
    parts.push(event.key.toLowerCase())

    const combination = parts.join('+')
    const handler = shortcutsRef.current[combination]
    
    if (handler) {
      if (preventDefault) event.preventDefault()
      if (stopPropagation) event.stopPropagation()
      handler(event)
    }
  }, [enabled, ignoreInputFocus, preventDefault, stopPropagation])

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])
}

export function useHotkey(
  hotkey: string,
  handler: (e: KeyboardEvent) => void,
  options: HotkeyOptions = {}
) {
  const { enabled = true } = options
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (matchesHotkey(e, hotkey)) {
        if (options.preventDefault !== false) e.preventDefault()
        if (options.stopPropagation) e.stopPropagation()
        handlerRef.current(e)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hotkey, enabled, options.preventDefault, options.stopPropagation])
}

export function useHotkeysContext() {
  const [registeredHotkeys, setRegisteredHotkeys] = useState<HotkeyRegistry[]>([])

  const register = useCallback((combination: string, handler: (e: KeyboardEvent) => void, options?: HotkeyOptions) => {
    hotkeyRegistry.set(combination, { combination, handler, options })
    setRegisteredHotkeys(prev => [...prev, { combination, handler, options }])
  }, [])

  const unregister = useCallback((combination: string) => {
    hotkeyRegistry.delete(combination)
    setRegisteredHotkeys(prev => prev.filter(h => h.combination !== combination))
  }, [])

  const getRegistered = useCallback(() => {
    return Array.from(hotkeyRegistry.values())
  }, [])

  return { registeredHotkeys, register, unregister, getRegistered }
}

// Предустановленные горячие клавиши для приложения
export function useAppHotkeys(actions: {
  practice?: () => void
  sprint?: () => void
  test?: () => void
  statistics?: () => void
  learning?: () => void
  tips?: () => void
  profile?: () => void
  newExercise?: () => void
  toggleKeyboard?: () => void
  toggleSound?: () => void
}) {
  useHotkeys({
    'ctrl+1': () => actions.practice?.(),
    'ctrl+2': () => actions.sprint?.(),
    'ctrl+3': () => actions.statistics?.(),
    'ctrl+4': () => actions.learning?.(),
    'ctrl+5': () => actions.tips?.(),
    'ctrl+p': () => actions.profile?.(),
    'ctrl+n': () => actions.newExercise?.(),
    'ctrl+k': () => actions.toggleKeyboard?.(),
    'ctrl+s': (e) => {
      e.preventDefault() // Предотвращаем сохранение страницы
      actions.toggleSound?.()
    },
    '?': () => {
      // Показ справки по горячим клавишам
      console.log(`
        ╔═══════════════════════════════════════╗
        ║     ГОРЯЧИЕ КЛАВИШИ FastFingers      ║
        ╠═══════════════════════════════════════╣
        ║  Ctrl+1  →  Практика                  ║
        ║  Ctrl+2  →  Спринт                    ║
        ║  Ctrl+3  →  Статистика                ║
        ║  Ctrl+4  →  Обучение                  ║
        ║  Ctrl+5  →  Советы                    ║
        ║  Ctrl+P  →  Профиль                   ║
        ║  Ctrl+N  →  Новое упражнение          ║
        ║  Ctrl+K  →  Вкл/Выкл клавиатуру       ║
        ║  Ctrl+S  →  Вкл/Выкл звук             ║
        ║  ?       →  Справка (это окно)        ║
        ╚═══════════════════════════════════════╝
      `)
    },
  })
}
