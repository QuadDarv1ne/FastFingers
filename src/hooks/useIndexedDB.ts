/**
 * useIndexedDB — Хук для работы с IndexedDB
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  get,
  put,
  remove,
  getAll,
  clear,
  add,
  isIndexedDBAvailable,
} from '../utils/indexedDB'
import type { DBStore } from '../utils/indexedDB'

type StoreName = keyof DBStore

interface UseIndexedDBReturn<T> {
  data: T | undefined
  loading: boolean
  error: Error | null
  add: (item: DBStore[StoreName]) => Promise<string>
  update: (item: DBStore[StoreName]) => Promise<string>
  remove: (key: string) => Promise<void>
  refresh: () => Promise<void>
}

interface UseIndexedDBAllReturn<T extends { id: string }> {
  data: T[]
  loading: boolean
  error: Error | null
  add: (item: DBStore[StoreName]) => Promise<string>
  update: (item: DBStore[StoreName]) => Promise<string>
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
  const loadIdRef = useRef(0)

  const loadData = useCallback(async () => {
    if (!isAvailable) {
      setLoading(false)
      setError(new Error('IndexedDB not available'))
      return
    }

    const loadId = ++loadIdRef.current

    try {
      setLoading(true)
      const result = await get(storeName, key)
      if (loadId !== loadIdRef.current) return
      setData(result as T)
      setError(null)
    } catch (err) {
      if (loadId !== loadIdRef.current) return
      setError(err as Error)
    } finally {
      if (loadId === loadIdRef.current) setLoading(false)
    }
  }, [storeName, key, isAvailable])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAdd = useCallback(
    async (newItem: DBStore[StoreName]) => {
      const id = await add(storeName, newItem)
      await loadData()
      return id
    },
    [storeName, loadData]
  )

  const handleUpdate = useCallback(
    async (newItem: DBStore[StoreName]) => {
      const id = await put(storeName, newItem)
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
  const loadIdRef = useRef(0)

  const loadData = useCallback(async () => {
    if (!isAvailable) {
      setLoading(false)
      setError(new Error('IndexedDB not available'))
      return
    }

    const loadId = ++loadIdRef.current

    try {
      setLoading(true)
      const result = await getAll(storeName)
      if (loadId !== loadIdRef.current) return
      setData(result as unknown as T[])
      setError(null)
    } catch (err) {
      if (loadId !== loadIdRef.current) return
      setError(err as Error)
    } finally {
      if (loadId === loadIdRef.current) setLoading(false)
    }
  }, [storeName, isAvailable])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAdd = useCallback(
    async (item: DBStore[StoreName]) => {
      const id = await add(storeName, item)
      await loadData()
      return id
    },
    [storeName, loadData]
  )

  const handleUpdate = useCallback(
    async (item: DBStore[StoreName]) => {
      const id = await put(storeName, item)
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
