/**
 * Типизированный API клиент с обработкой ошибок
 * 
 * @example
 * const apiClient = new ApiClient({ baseURL: '/api' })
 * const users = await apiClient.get<User[]>('/users')
 * const user = await apiClient.post<User, CreateUserDto>('/users', data)
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  retryAttempts?: number
  retryDelay?: number
}

export interface ApiErrorData {
  status: number
  message: string
  code?: string
  details?: Record<string, string[]>
}

export class ApiError extends Error {
  public readonly status: number
  public readonly code?: string
  public readonly details?: Record<string, string[]>

  constructor(message: string, status: number, code?: string, details?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }

  static isNetworkError(error: unknown): error is NetworkError {
    return error instanceof NetworkError
  }
}

export class TimeoutError extends Error {
  constructor() {
    super('Request timeout')
    this.name = 'TimeoutError'
  }

  static isTimeoutError(error: unknown): error is TimeoutError {
    return error instanceof TimeoutError
  }
}

export interface RequestConfig<T = unknown> {
  headers?: Record<string, string>
  signal?: AbortSignal
  body?: T
  timeout?: number
}

export class ApiClient {
  private readonly baseURL: string
  private readonly timeout: number
  private readonly defaultHeaders: Record<string, string>
  private readonly retryAttempts: number
  private readonly retryDelay: number

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || ''
    this.timeout = config.timeout || 30000
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    }
    this.retryAttempts = config.retryAttempts ?? 1
    this.retryDelay = config.retryDelay ?? 1000
  }

  /**
   * GET запрос
   */
  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({ method: 'GET', url, ...config })
  }

  /**
   * POST запрос
   */
  async post<T, B = unknown>(url: string, body?: B, config?: RequestConfig<B>): Promise<T> {
    return this.request<T>({ method: 'POST', url, body, ...config })
  }

  /**
   * PUT запрос
   */
  async put<T, B = unknown>(url: string, body?: B, config?: RequestConfig<B>): Promise<T> {
    return this.request<T>({ method: 'PUT', url, body, ...config })
  }

  /**
   * PATCH запрос
   */
  async patch<T, B = unknown>(url: string, body?: B, config?: RequestConfig<B>): Promise<T> {
    return this.request<T>({ method: 'PATCH', url, body, ...config })
  }

  /**
   * DELETE запрос
   */
  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({ method: 'DELETE', url, ...config })
  }

  /**
   * Базовый метод для выполнения запросов
   */
  private async request<T>(config: RequestConfig & { method: HttpMethod; url: string }): Promise<T> {
    const { method, url, body, headers, signal, timeout } = config
    
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout || this.timeout)

        const response = await fetch(this.baseURL + url, {
          method,
          headers: {
            ...this.defaultHeaders,
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: signal || controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response)
          throw new ApiError(
            errorData.message || `HTTP ${response.status}`,
            response.status,
            errorData.code,
            errorData.details
          )
        }

        // Пустой ответ для 204 No Content
        if (response.status === 204) {
          return {} as T
        }

        return await response.json()
      } catch (error) {
        lastError = error as Error

        // Не повторяем запрос при ошибках клиента (4xx)
        if (ApiError.isApiError(error) && error.status >= 400 && error.status < 500) {
          break
        }

        // Не повторяем при отмене
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new TimeoutError()
        }

        // Ждём перед повторной попыткой
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * (attempt + 1))
        }
      }
    }

    throw lastError || new NetworkError('Unknown error')
  }

  /**
   * Парсинг ответа об ошибке
   */
  private async parseErrorResponse(response: Response): Promise<ApiErrorData> {
    try {
      const data = await response.json()
      return {
        status: response.status,
        message: data.message || data.error || 'Unknown error',
        code: data.code,
        details: data.details,
      }
    } catch {
      return {
        status: response.status,
        message: `HTTP ${response.status}`,
      }
    }
  }

  /**
   * Задержка перед повторной попыткой
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Установка токена авторизации
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  /**
   * Удаление токена авторизации
   */
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization']
  }
}

// Экспорт экземпляра по умолчанию
export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  retryAttempts: 1,
  retryDelay: 500,
})
