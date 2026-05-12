import { describe, it, expect, vi } from 'vitest'
import { BraceletHttpAdapter } from './bracelet.adapter.http'
import type { HttpClient } from '@/modules/shared/http/http-client'

function makeClient(get: ReturnType<typeof vi.fn>): HttpClient {
  return { get } as unknown as HttpClient
}

describe('BraceletHttpAdapter — getPaginatedByEvent', () => {
  it('GETs /bracelets/event/:eventId/paginated with query params', async () => {
    const dto = { items: [], total: 0, page: 1, limit: 20, totalPages: 0 }
    const get = vi.fn().mockResolvedValue({ data: { data: dto }, error: null })
    const adapter = new BraceletHttpAdapter(makeClient(get))

    await adapter.getPaginatedByEvent({ eventId: 'e1', page: 2, limit: 50, search: 'nfc-' })
    expect(get).toHaveBeenCalledWith('/bracelets/event/e1/paginated?page=2&limit=50&search=nfc-')
  })

  it('omits search when empty', async () => {
    const get = vi.fn().mockResolvedValue({
      data: { data: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 } },
      error: null,
    })
    const adapter = new BraceletHttpAdapter(makeClient(get))
    await adapter.getPaginatedByEvent({ eventId: 'e1', page: 1, limit: 20, search: '' })
    expect(get).toHaveBeenCalledWith('/bracelets/event/e1/paginated?page=1&limit=20')
  })
})

describe('BraceletHttpAdapter — getAvailable', () => {
  it('GETs /bracelets/available with eventId query param', async () => {
    const bracelets = [{ id: 'b1', nfcId: 'nfc-001', status: 'pre_activated' }]
    const get = vi.fn().mockResolvedValue({ data: { data: bracelets }, error: null })
    const adapter = new BraceletHttpAdapter(makeClient(get))

    const result = await adapter.getAvailable('event-1')

    expect(get).toHaveBeenCalledWith('/bracelets/available?eventId=event-1')
    expect(result).toEqual(bracelets)
  })

  it('throws on HTTP error', async () => {
    const get = vi.fn().mockResolvedValue({ data: null, error: { status: 500, message: 'oops' } })
    const adapter = new BraceletHttpAdapter(makeClient(get))

    await expect(adapter.getAvailable('event-1')).rejects.toThrow('oops')
  })
})
