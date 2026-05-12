import type { HttpRequestConfig, HttpResponse, HttpError } from '../types/http.type'
import type { ResultType } from '../types/result.type'
import { tryCatch } from '../utils/try-catch'

let _sharedInstance: HttpClient | null = null

export function getSharedHttpClient(): HttpClient {
  if (_sharedInstance) return _sharedInstance
  const baseURL = import.meta.env.VITE_API_URL || '/api'
  _sharedInstance = new HttpClient(baseURL)
  return _sharedInstance
}

export class HttpClient {
  private readonly baseURL: string
  private readonly defaultHeaders: Record<string, string>

  constructor(baseURL: string, defaultHeaders?: Record<string, string>) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    }
  }

  private buildURL(url: string, params?: Record<string, string | number | boolean>): string {
    const path = url.startsWith('/') ? url : `/${url}`
    const fullPath = `${this.baseURL}${path}`

    let resolvedUrl: string
    if (fullPath.startsWith('http')) {
      resolvedUrl = fullPath
    } else {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      resolvedUrl = `${origin}${fullPath}`
    }

    const urlObj = new URL(resolvedUrl)
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        urlObj.searchParams.set(key, String(value))
      }
    }
    return urlObj.toString()
  }

  private toHttpError(error: Error): HttpError {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { message: 'Request aborted', status: null }
    }
    return { message: error.message, status: null }
  }

  async request<T>(config: HttpRequestConfig): Promise<ResultType<HttpResponse<T>, HttpError>> {
    const url = this.buildURL(config.url, config.params)
    const headers: Record<string, string> = { ...this.defaultHeaders, ...config.headers }

    const controller = new AbortController()
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    if (config.timeout) {
      timeoutId = setTimeout(() => controller.abort(), config.timeout)
    }

    const result = await tryCatch<Response>(
      fetch(url, {
        method: config.method ?? 'GET',
        headers,
        ...(config.body ? { body: JSON.stringify(config.body) } : {}),
        signal: config.signal ?? controller.signal,
      }),
    )

    if (timeoutId) clearTimeout(timeoutId)

    if (result.error) {
      return { data: null, error: this.toHttpError(result.error) }
    }

    const response = result.data

    if (!response.ok) {
      const errorBody = await tryCatch<{ error?: string }>(response.json())
      const message = errorBody.data?.error ?? response.statusText ?? `HTTP ${response.status}`
      return { data: null, error: { message, status: response.status } }
    }

    const jsonResult = await tryCatch<{ success: boolean; data: T; error?: string }>(
      response.json() as Promise<{ success: boolean; data: T; error?: string }>,
    )

    if (jsonResult.error) {
      return { data: null, error: this.toHttpError(jsonResult.error) }
    }

    if (!jsonResult.data.success) {
      return { data: null, error: { message: jsonResult.data.error ?? 'Request failed', status: response.status } }
    }

    return {
      data: { data: jsonResult.data.data, status: response.status, headers: response.headers },
      error: null,
    }
  }

  async get<T>(url: string, params?: Record<string, string | number | boolean>) {
    return this.request<T>({ url, method: 'GET', ...(params ? { params } : {}) })
  }

  async post<T>(url: string, body?: unknown) {
    return this.request<T>({ url, method: 'POST', ...(body ? { body } : {}) })
  }

  async patch<T>(url: string, body?: unknown) {
    return this.request<T>({ url, method: 'PATCH', ...(body ? { body } : {}) })
  }

  async put<T>(url: string, body?: unknown) {
    return this.request<T>({ url, method: 'PUT', ...(body ? { body } : {}) })
  }

  async delete<T>(url: string) {
    return this.request<T>({ url, method: 'DELETE' })
  }

  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  removeAuthToken() {
    delete this.defaultHeaders['Authorization']
  }
}
