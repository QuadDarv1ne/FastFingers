import { useState, useCallback, useEffect, useRef } from 'react'

interface SelectedStudentState {
  userId: string | null
  userName: string | null
}

let state: SelectedStudentState = { userId: null, userName: null }
const listeners = new Set<() => void>()

function setState(next: SelectedStudentState) {
  state = next
  listeners.forEach(fn => fn())
}

export function useSelectedStudent() {
  const [value, setValue] = useState(state)

  useEffect(() => {
    const listener = () => setValue({ ...state })
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }, [])

  const select = useCallback((userId: string, userName: string) => {
    setState({ userId, userName })
  }, [])

  const clear = useCallback(() => {
    setState({ userId: null, userName: null })
  }, [])

  // Keep ref in sync for stale-closure safety
  const valueRef = useRef(value)
  valueRef.current = value

  return { userId: value.userId, userName: value.userName, select, clear, valueRef }
}
