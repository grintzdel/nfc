import { describe, it, expect, vi } from 'vitest'
import { CheckInHttpAdapter } from './check-in.adapter.http'
import type { HttpClient } from '@/modules/shared/http/http-client'

function makeClient(get: ReturnType<typeof vi.fn>): HttpClient {
  return { get } as unknown as HttpClient
}

describe('CheckInHttpAdapter — getPaginatedByEvent', () => {
  it('GETs /check-ins/event/:eventId/paginated with query params', async () => {
    const dto = { items: [], total: 0, page: 1, limit: 20, totalPages: 0 }
    const get = vi.fn().mockResolvedValue({ data: { data: dto }, error: null })
    const adapter = new CheckInHttpAdapter(makeClient(get))

    const result = await adapter.getPaginatedByEvent({ eventId: 'e1', page: 2, limit: 50 })

    expect(get).toHaveBeenCalledWith('/check-ins/event/e1/paginated?page=2&limit=50')
    expect(result).toEqual(dto)
  })

  it('throws on HTTP error', async () => {
    const get = vi.fn().mockResolvedValue({ data: null, error: { status: 500, message: 'oops' } })
    const adapter = new CheckInHttpAdapter(makeClient(get))
    await expect(adapter.getPaginatedByEvent({ eventId: 'e1', page: 1, limit: 20 })).rejects.toThrow('oops')
  })
})
