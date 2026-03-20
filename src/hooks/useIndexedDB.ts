/**
 * useIndexedDB — Хук для работы с IndexedDB
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useState, useEffect, useCallback } from 'react'
import {
  openDB,
  add,
  get,
  put,
  remove,
  getAll,
  clear,
  isIndexedDBAvailable,
} from '../utils/indexedDB'

type StoreName = 'sessions' | 'settings' | 'progress' | 'achievements'

interface UseIndexedDBReturn<T> {
  data: T | undefined
  loading: boolean
  error: Error | null
  add: (item: T) => Promise<string>
  update: (item: T) => Promise<string>
  remove: (key: string) => Promise<void>
  refresh: () => Promise<void>
}

interface UseIndexedDBAllReturn<T> {
  data: T[]
  loading: boolean
  error: Error | null
  add: (item: T) => Promise<string>
  update: (item: T) => Promise<string>
  remove: (key: string) => Promise<void>
  clear: () => Promise<void>
  refresh: () => Promise<void>
}

/**
 * Хук для получения одной записи из IndexedDB
 */
export function useIndexedDB<T>(
  storeName: StoreName,
  key: string
): UseIndexedDBReturn<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const isAvailable = isIndexedDBAvailable()

  const loadData = useCallback(async () => {
    if (!isAvailable) {
      setLoading(false)
      setError(new Error('IndexedDB not available'))
      return
    }

    try {
      setLoading(true)
      const result = await get(storeName, key)
      setData(result as T)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [storeName, key, isAvailable])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAdd = useCallback(
    async (item: T) => {
      const id = await add(storeName, item as any)
      await loadData()
      return id
    },
    [storeName, item, loadData]
  )

  const handleUpdate = useCallback(
    async (item: T) => {
      const id = await put(storeName, item as any)
      await loadData()
      return id
    },
    [storeName, item, loadData]
  )

  const handleRemove = useCallback(
    async (keyToRemove: string) => {
      await remove(storeName, keyToRemove)
      await loadData()
    },
    [storeName, key, loadData]
  )

  return {
    data,
    loading,
    error,
    add: handleAdd,
    update: handleUpdate,
    remove: handleRemove,
    refresh: loadData,
  }
}

/**
 * Хук для получения всех записей из IndexedDB
 */
export function useIndexedDBAll<T extends { id: string }>(
  storeName: StoreName
): UseIndexedDBAllReturn<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const isAvailable = isIndexedDBAvailable()

  const loadData = useCallback(async () => {
    if (!isAvailable) {
      setLoading(false)
      setError(new Error('IndexedDB not available'))
      return
    }

    try {
      setLoading(true)
      const result = await getAll(storeName)
      setData(result as T[])
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [storeName, isAvailable])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAdd = useCallback(
    async (item: T) => {
      const id = await add(storeName, item as any)
      await loadData()
      return id
    },
    [storeName, loadData]
  )

  const handleUpdate = useCallback(
    async (item: T) => {
      const id = await put(storeName, item as any)
      await loadData()
      return id
    },
    [storeName, loadData]
  )

  const handleRemove = useCallback(
    async (keyToRemove: string) => {
      await remove(storeName, keyToRemove)
      await loadData()
    },
    [storeName, loadData]
  )

  const handleClear = useCallback(async () => {
    await clear(storeName)
    await loadData()
  }, [storeName, loadData])

  return {
    data,
    loading,
    error,
    add: handleAdd,
    update: handleUpdate,
    remove: handleRemove,
    clear: handleClear,
    refresh: loadData,
  }
}

export default useIndexedDB
