import { useCallback } from 'react'
import { simulateInput } from '../utils/inputEvent'

export function useTypingKeyDown(handleInput: (e: React.FormEvent<HTMLInputElement>) => void) {
  return useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key.length > 1 && e.key !== 'Enter') return
    e.preventDefault()
    const input = e.currentTarget
    input.value = e.key === 'Enter' ? '\n' : e.key
    handleInput(simulateInput(input))
  }, [handleInput])
}
