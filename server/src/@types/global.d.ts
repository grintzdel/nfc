type Nullable<T> = T | null

interface PaginationParams {
  page: number
  limit: number
  search?: string
  status?: string
}

interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

declare namespace Express {
  interface Request {
    user?: {
      userId: string
      role: string
    }
  }
}
