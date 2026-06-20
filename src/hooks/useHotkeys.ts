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

function isElement(target: EventTarget | null): target is Element {
  return target instanceof Element
}

function isInputElement(target: Element): boolean {
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    (target instanceof HTMLElement && target.isContentEditable)
  )
}

export function useHotkeys(
  shortcuts: Record<string, (e: KeyboardEvent) => void>,
  options: HotkeyOptions = {}
) {
  const { 
    enabled = true, 
    ignoreInputFocus = false,
    preventDefault = true,
    stopPropagation = false
  } = options
  
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    if (!ignoreInputFocus && isElement(event.target) && isInputElement(event.target)) {
      return
    }

    const shortcuts = shortcutsRef.current
    for (const [hotkey, handler] of Object.entries(shortcuts)) {
      if (matchesHotkey(event, hotkey)) {
        if (preventDefault) event.preventDefault()
        if (stopPropagation) event.stopPropagation()
        handler(event)
        return
      }
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
  const { enabled = true, ignoreInputFocus = false, preventDefault = true, stopPropagation = false } = options
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (!ignoreInputFocus && isElement(e.target) && isInputElement(e.target)) return
      if (matchesHotkey(e, hotkey)) {
        if (preventDefault) e.preventDefault()
        if (stopPropagation) e.stopPropagation()
        handlerRef.current(e)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hotkey, enabled, preventDefault, stopPropagation, ignoreInputFocus])
}
