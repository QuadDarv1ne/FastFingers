import { useMemo, useState, useCallback } from 'react'

interface UsePaginationOptions<T> {
  items: T[]
  itemsPerPage?: number
  initialPage?: number
}

interface UsePaginationReturn<T> {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  paginatedItems: T[]
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: () => void
  previousPage: () => void
  goToPage: (page: number) => void
  firstPage: () => void
  lastPage: () => void
  setItemsPerPage: (count: number) => void
}

/**
 * Хук для пагинации списков данных
 * 
 * @example
 * ```tsx
 * const {
 *   currentPage,
 *   totalPages,
 *   paginatedItems,
 *   nextPage,
 *   previousPage,
 *   goToPage
 * } = usePagination({ items: data, itemsPerPage: 10 })
 * 
 * return (
 *   <>
 *     {paginatedItems.map(item => <Item key={item.id} {...item} />)}
 *     <Pagination
 *       currentPage={currentPage}
 *       totalPages={totalPages}
 *       onNext={nextPage}
 *       onPrevious={previousPage}
 *     />
 *   </>
 * )
 * ```
 */
export function usePagination<T>({
  items,
  itemsPerPage = 10,
  initialPage = 1
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(Math.max(1, initialPage))
  const [currentItemsPerPage, setCurrentItemsPerPage] = useState(itemsPerPage)

  const totalPages = Math.ceil(items.length / currentItemsPerPage)

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * currentItemsPerPage
    const endIndex = startIndex + currentItemsPerPage
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, currentItemsPerPage])

  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }, [totalPages])

  const previousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }, [])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  const firstPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages)
  }, [totalPages])

  const setItemsPerPage = useCallback((count: number) => {
    setCurrentItemsPerPage(Math.max(1, count))
    setCurrentPage(1) // Сброс на первую страницу при изменении размера
  }, [])

  return {
    currentPage,
    totalPages,
    totalItems: items.length,
    itemsPerPage: currentItemsPerPage,
    paginatedItems,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage,
    firstPage,
    lastPage,
    setItemsPerPage
  }
}
