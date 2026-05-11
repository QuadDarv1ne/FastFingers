/**
 * Тесты для IndexedDB утилит
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  openDB,
  add,
  get,
  put,
  remove,
  getAll,
  clear,
  deleteDB,
  isIndexedDBAvailable,
  migrateFromLocalStorage,
} from '../utils/indexedDB'

describe('IndexedDB', () => {
  const TEST_STORE = 'sessions'
  const TEST_DATA = {
    id: 'test-1',
    date: Date.now(),
    wpm: 60,
    cpm: 300,
    accuracy: 95,
    errors: 2,
    correctChars: 500,
    totalChars: 526,
    timeElapsed: 120,
    mode: 'practice',
  }

  beforeEach(async () => {
    // Очищаем базу перед каждым тестом
    await deleteDB()
  })

  afterEach(async () => {
    await deleteDB()
    vi.restoreAllMocks()
  })

  it('should check if IndexedDB is available', () => {
    expect(isIndexedDBAvailable()).toBe(true)
  })

  it('should open database', async () => {
    const db = await openDB()
    expect(db).toBeDefined()
    expect(db.name).toBe('fastfingers-db')
  })

  it('should add a record to sessions store', async () => {
    const id = await add(TEST_STORE, TEST_DATA)
    expect(id).toBe('test-1')

    const retrieved = await get(TEST_STORE, 'test-1')
    expect(retrieved).toEqual(TEST_DATA)
  })

  it('should get a record by key', async () => {
    await add(TEST_STORE, TEST_DATA)
    const retrieved = await get(TEST_STORE, 'test-1')
    expect(retrieved).toEqual(TEST_DATA)
  })

  it('should return undefined for non-existent key', async () => {
    const retrieved = await get(TEST_STORE, 'non-existent')
    expect(retrieved).toBeUndefined()
  })

  it('should update a record', async () => {
    await add(TEST_STORE, TEST_DATA)

    const updatedData = { ...TEST_DATA, wpm: 70 }
    await put(TEST_STORE, updatedData)

    const retrieved = await get(TEST_STORE, 'test-1')
    expect(retrieved?.wpm).toBe(70)
  })

  it('should remove a record', async () => {
    await add(TEST_STORE, TEST_DATA)
    await remove(TEST_STORE, 'test-1')

    const retrieved = await get(TEST_STORE, 'test-1')
    expect(retrieved).toBeUndefined()
  })

  it('should get all records from store', async () => {
    const data1 = { ...TEST_DATA, id: 'test-1', wpm: 60 }
    const data2 = { ...TEST_DATA, id: 'test-2', wpm: 70 }
    const data3 = { ...TEST_DATA, id: 'test-3', wpm: 80 }

    await add(TEST_STORE, data1)
    await add(TEST_STORE, data2)
    await add(TEST_STORE, data3)

    const all = await getAll(TEST_STORE)
    expect(all).toHaveLength(3)
    expect(all.map((item) => item.wpm)).toContain(60)
    expect(all.map((item) => item.wpm)).toContain(70)
    expect(all.map((item) => item.wpm)).toContain(80)
  })

  it('should clear all records from store', async () => {
    await add(TEST_STORE, TEST_DATA)
    await clear(TEST_STORE)

    const all = await getAll(TEST_STORE)
    expect(all).toHaveLength(0)
  })

  it('should delete the database', async () => {
    await openDB()
    await deleteDB()

    const db = await openDB()
    expect(db).toBeDefined()
  })

  it('should migrate data from localStorage', async () => {
    const localStorageKey = 'test-sessions'
    const testData = [
      { id: 'mig-1', wpm: 50 },
      { id: 'mig-2', wpm: 60 },
      { id: 'mig-3', wpm: 70 },
    ]

    localStorage.setItem(localStorageKey, JSON.stringify(testData))

    const migrated = await migrateFromLocalStorage(localStorageKey, TEST_STORE)
    expect(migrated).toBe(3)

    const all = await getAll(TEST_STORE)
    expect(all).toHaveLength(3)
    expect(all.map((item) => item.wpm)).toContain(50)
    expect(all.map((item) => item.wpm)).toContain(60)
    expect(all.map((item) => item.wpm)).toContain(70)
  })

  it('should handle migration with transform function', async () => {
    const localStorageKey = 'test-settings'
    const testData = { volume: 0.5, theme: 'dark' }

    localStorage.setItem(localStorageKey, JSON.stringify(testData))

    const transform = (data: any) => ({
      key: 'settings',
      value: data,
      updatedAt: Date.now(),
    })

    const migrated = await migrateFromLocalStorage(
      localStorageKey,
      'settings',
      transform
    )

    expect(migrated).toBe(1)

    const settings = await get('settings', 'settings')
    const value = settings?.value as Record<string, unknown> | undefined
    expect(value?.volume).toBe(0.5)
    expect(value?.theme).toBe('dark')
  })

  it('should handle errors gracefully', async () => {
    localStorage.setItem('invalid-json', 'not-valid-json')

    const migrated = await migrateFromLocalStorage('invalid-json', TEST_STORE)
    expect(migrated).toBe(0)
  })

  it('should return 0 if localStorage key does not exist', async () => {
    const migrated = await migrateFromLocalStorage('non-existent', TEST_STORE)
    expect(migrated).toBe(0)
  })
})
