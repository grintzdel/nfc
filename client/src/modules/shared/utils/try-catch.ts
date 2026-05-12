import type { ResultType } from '../types/result.type'

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<ResultType<T, E>> {
  try {
    const data: Awaited<T> = await promise
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as E }
  }
}
