import { describe, it, expect, vi } from 'vitest'
import { ParticipantHttpAdapter } from './participant.adapter.http'
import type { HttpClient } from '@/modules/shared/http/http-client'

function makeClient(get: ReturnType<typeof vi.fn>): HttpClient {
  return { get } as unknown as HttpClient
}

describe('ParticipantHttpAdapter — getPaginatedByEvent', () => {
  it('GETs /participants/event/:eventId/paginated with query params and returns the DTO', async () => {
    const dto = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    }
    const get = vi.fn().mockResolvedValue({ data: { data: dto }, error: null })
    const adapter = new ParticipantHttpAdapter(makeClient(get))

    const result = await adapter.getPaginatedByEvent({ eventId: 'e1', page: 2, limit: 50, search: 'marie' })

    expect(get).toHaveBeenCalledWith('/participants/event/e1/paginated?page=2&limit=50&search=marie')
    expect(result).toEqual(dto)
  })

  it('omits the search param when empty', async () => {
    const get = vi.fn().mockResolvedValue({
      data: { data: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 } },
      error: null,
    })
    const adapter = new ParticipantHttpAdapter(makeClient(get))

    await adapter.getPaginatedByEvent({ eventId: 'e1', page: 1, limit: 20, search: '' })

    expect(get).toHaveBeenCalledWith('/participants/event/e1/paginated?page=1&limit=20')
  })
})
