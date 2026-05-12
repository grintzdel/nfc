export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type HttpRequestConfig = {
  url: string
  method?: HttpMethod
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean>
  body?: unknown
  timeout?: number
  signal?: AbortSignal
}

export type HttpResponse<T> = {
  data: T
  status: number
  headers: Headers
}

export type HttpError = {
  message: string
  status: number | null
}
