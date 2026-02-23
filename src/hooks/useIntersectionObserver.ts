import { useEffect, useRef, useState, RefObject, useCallback } from 'react'

export interface UseIntersectionObserverOptions {
  /** Элемент-контейнер для наблюдения */
  root?: Element | Document | null
  /** Отступ от контейнера */
  rootMargin?: string
  /** Порог видимости (0-1) */
  threshold?: number | number[]
}

export interface UseIntersectionObserverReturn {
  /** Ссылка на наблюдаемый элемент */
  ref: RefObject<Element | null>
  /** Элемент виден в области просмотра */
  isIntersecting: boolean
  /** Запись наблюдения */
  entry?: IntersectionObserverEntry
  /** Отключить наблюдение */
  disconnect: () => void
  /** Переподключить наблюдение */
  observe: () => void
}

/**
 * Хук для отслеживания видимости элемента с помощью IntersectionObserver
 * 
 * @example
 * const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 })
 * <div ref={ref}>{isIntersecting ? 'Visible' : 'Hidden'}</div>
 * 
 * @example
 * const { ref, entry } = useIntersectionObserver({ threshold: [0, 0.5, 1] })
 * const progress = entry?.intersectionRatio || 0
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const { root = null, rootMargin = '0px', threshold = 0 } = options

  const elementRef = useRef<Element | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [entry, setEntry] = useState<IntersectionObserverEntry>()

  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    // Создаём наблюдателя
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [firstEntry] = entries
        if (firstEntry) {
          setEntry(firstEntry)
          setIsIntersecting(firstEntry.isIntersecting)
        }
      },
      { root, rootMargin, threshold }
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [root, rootMargin, threshold])

  useEffect(() => {
    const element = elementRef.current

    if (element && observerRef.current) {
      observerRef.current.observe(element)
    }

    return () => {
      if (element && observerRef.current) {
        observerRef.current.unobserve(element)
      }
    }
  }, [])

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
  }, [])

  const observe = useCallback(() => {
    const element = elementRef.current

    if (element && observerRef.current) {
      observerRef.current.observe(element)
    }
  }, [])

  return {
    ref: elementRef as RefObject<Element | null>,
    isIntersecting,
    entry,
    disconnect,
    observe,
  }
}

/**
 * Хук для ленивой загрузки компонентов при появлении в области видимости
 * 
 * @example
 * const { ref, isVisible } = useLazyLoad()
 * {isVisible && <HeavyComponent />}
 */
export function useLazyLoad(
  options: UseIntersectionObserverOptions = {}
): { ref: RefObject<Element | null>; isVisible: boolean } {
  const { ref, isIntersecting } = useIntersectionObserver({
    ...options,
    threshold: options.threshold || 0.1,
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isIntersecting) {
      setIsVisible(true)
    }
  }, [isIntersecting])

  return { ref, isVisible }
}

/**
 * Хук для бесконечной прокрутки
 * 
 * @example
 * const { ref, isLoading } = useInfiniteScroll({
 *   onLoadMore: () => loadMoreItems()
 * })
 * 
 * <div ref={ref}>
 *   {items.map(item => <Item key={item.id} {...item} />)}
 *   {isLoading && <Spinner />}
 * </div>
 */
export function useInfiniteScroll(
  onLoadMore: () => void | Promise<void>,
  options: UseIntersectionObserverOptions & {
    /** Задержка перед следующим вызовом */
    delay?: number
    /** Отключить загрузку */
    disabled?: boolean
  } = {}
): { ref: RefObject<Element | null>; isLoading: boolean } {
  const { delay = 100, disabled = false, ...observerOptions } = options

  const { ref, isIntersecting } = useIntersectionObserver(observerOptions)
  const [isLoading, setIsLoading] = useState(false)
  const isLoadingRef = useRef(false)

  useEffect(() => {
    if (isIntersecting && !disabled && !isLoadingRef.current) {
      isLoadingRef.current = true
      setIsLoading(true)

      const load = async () => {
        try {
          await onLoadMore()
        } finally {
          isLoadingRef.current = false
          setIsLoading(false)
        }
      }

      const timeoutId = setTimeout(load, delay)

      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [isIntersecting, disabled, delay, onLoadMore])

  return { ref, isLoading }
}
