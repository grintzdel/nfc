import { describe, it, expect, vi } from 'vitest'
import { BraceletHttpAdapter } from './bracelet.adapter.http'
import type { HttpClient } from '@/modules/shared/http/http-client'

function makeClient(get: ReturnType<typeof vi.fn>): HttpClient {
  return { get } as unknown as HttpClient
}

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
