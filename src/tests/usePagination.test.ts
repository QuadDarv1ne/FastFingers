import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePagination } from '../hooks/usePagination'

describe('usePagination', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  it('должен пагинировать элементы с настройками по умолчанию', () => {
    const { result } = renderHook(() => usePagination({ items }))

    expect(result.current.currentPage).toBe(1)
    expect(result.current.totalPages).toBe(2) // 12 элементов / 10 на страницу = 2
    expect(result.current.totalItems).toBe(12)
    expect(result.current.itemsPerPage).toBe(10)
    expect(result.current.paginatedItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('должен поддерживать custom itemsPerPage', () => {
    const { result } = renderHook(() => usePagination({ items, itemsPerPage: 5 }))

    expect(result.current.totalPages).toBe(3) // 12 / 5 = 2.4 -> 3
    expect(result.current.paginatedItems).toEqual([1, 2, 3, 4, 5])
  })

  it('должен поддерживать initialPage', () => {
    const { result } = renderHook(() =>
      usePagination({ items, itemsPerPage: 5, initialPage: 2 })
    )

    expect(result.current.currentPage).toBe(2)
    expect(result.current.paginatedItems).toEqual([6, 7, 8, 9, 10])
  })

  it('должен переходить на следующую страницу', () => {
    const { result } = renderHook(() => usePagination({ items, itemsPerPage: 5 }))

    act(() => {
      result.current.nextPage()
    })

    expect(result.current.currentPage).toBe(2)
    expect(result.current.paginatedItems).toEqual([6, 7, 8, 9, 10])
  })

  it('должен переходить на предыдущую страницу', () => {
    const { result } = renderHook(() =>
      usePagination({ items, itemsPerPage: 5, initialPage: 2 })
    )

    act(() => {
      result.current.previousPage()
    })

    expect(result.current.currentPage).toBe(1)
  })

  it('должен переходить на конкретную страницу', () => {
    const { result } = renderHook(() => usePagination({ items, itemsPerPage: 5 }))

    act(() => {
      result.current.goToPage(3)
    })

    expect(result.current.currentPage).toBe(3)
    expect(result.current.paginatedItems).toEqual([11, 12])
  })

  it('должен переходить на первую страницу', () => {
    const { result } = renderHook(() =>
      usePagination({ items, itemsPerPage: 5, initialPage: 3 })
    )

    act(() => {
      result.current.firstPage()
    })

    expect(result.current.currentPage).toBe(1)
  })

  it('должен переходить на последнюю страницу', () => {
    const { result } = renderHook(() => usePagination({ items, itemsPerPage: 5 }))

    act(() => {
      result.current.lastPage()
    })

    expect(result.current.currentPage).toBe(3)
  })

  it('должен ограничивать nextPage последней страницей', () => {
    const { result } = renderHook(() => usePagination({ items, itemsPerPage: 5 }))

    act(() => {
      result.current.nextPage()
      result.current.nextPage()
      result.current.nextPage() // Должно остаться на 3
    })

    expect(result.current.currentPage).toBe(3)
  })

  it('должен ограничивать previousPage первой страницей', () => {
    const { result } = renderHook(() => usePagination({ items, itemsPerPage: 5 }))

    act(() => {
      result.current.previousPage() // Должно остаться на 1
    })

    expect(result.current.currentPage).toBe(1)
  })

  it('должен возвращать hasNextPage и hasPreviousPage', () => {
    const { result } = renderHook(() =>
      usePagination({ items, itemsPerPage: 5, initialPage: 2 })
    )

    expect(result.current.hasNextPage).toBe(true)
    expect(result.current.hasPreviousPage).toBe(true)

    act(() => {
      result.current.firstPage()
    })

    expect(result.current.hasNextPage).toBe(true)
    expect(result.current.hasPreviousPage).toBe(false)

    act(() => {
      result.current.lastPage()
    })

    expect(result.current.hasNextPage).toBe(false)
    expect(result.current.hasPreviousPage).toBe(true)
  })

  it('должен изменять itemsPerPage и сбрасывать на страницу 1', () => {
    const { result } = renderHook(() =>
      usePagination({ items, itemsPerPage: 5, initialPage: 2 })
    )

    act(() => {
      result.current.setItemsPerPage(3)
    })

    expect(result.current.itemsPerPage).toBe(3)
    expect(result.current.currentPage).toBe(1)
    expect(result.current.totalPages).toBe(4) // 12 / 3 = 4
  })

  it('должен возвращать пустой массив для несуществующей страницы', () => {
    const emptyItems: number[] = []
    const { result } = renderHook(() => usePagination({ items: emptyItems }))

    expect(result.current.paginatedItems).toEqual([])
    expect(result.current.totalPages).toBe(0)
  })

  it('должен корректно работать с одним элементом', () => {
    const { result } = renderHook(() => usePagination({ items: [1] }))

    expect(result.current.totalPages).toBe(1)
    expect(result.current.paginatedItems).toEqual([1])
  })
})
