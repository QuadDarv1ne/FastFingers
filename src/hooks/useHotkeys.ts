import { useEffect, useCallback, useRef } from 'react'

export interface HotkeyOptions {
  enabled?: boolean
  ignoreInputFocus?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
}

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
  if (modifiers.length !== eventModifiers.length) return false
  if (!modifiers.every(m => eventModifiers.includes(m))) return false
  return normalizeKey(event.key) === key
}

function isInputElement(target: HTMLElement): boolean {
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
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
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, handleKeyDown])
}

export function useHotkey(
  hotkey: string,
  handler: (e: KeyboardEvent) => void,
  options: HotkeyOptions = {}
) {
  const { enabled = true, ignoreInputFocus = true } = options
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (!ignoreInputFocus && isInputElement(e.target as HTMLElement)) return
      if (matchesHotkey(e, hotkey)) {
        if (options.preventDefault !== false) e.preventDefault()
        if (options.stopPropagation) e.stopPropagation()
        handlerRef.current(e)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hotkey, enabled, options.preventDefault, options.stopPropagation, ignoreInputFocus])
}
