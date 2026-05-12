import { describe, it, expect, vi } from 'vitest'
import { NfcHttpAdapter } from './nfc.adapter.http'
import { NfcBraceletNotActiveError } from '../errors/nfc.error'
import type { HttpClient } from '@/modules/shared/http/http-client'

function makeClient(get: ReturnType<typeof vi.fn>): HttpClient {
  return { get } as unknown as HttpClient
}

describe('NfcHttpAdapter', () => {
  it('returns the DTO on success', async () => {
    const get = vi.fn().mockResolvedValue({
      data: { data: { bracelet: { nfcId: 'x', status: 'active' }, participant: { id: 'p1' }, event: { id: 'e1' } } },
      error: null,
    })
    const adapter = new NfcHttpAdapter(makeClient(get))
    const result = await adapter.getByNfcId('x')
    expect(result.bracelet.nfcId).toBe('x')
    expect(get).toHaveBeenCalledWith('/nfc/x')
  })

  it('throws NfcBraceletNotActiveError on 404', async () => {
    const get = vi.fn().mockResolvedValue({ data: null, error: { status: 404, message: 'not found' } })
    const adapter = new NfcHttpAdapter(makeClient(get))
    await expect(adapter.getByNfcId('x')).rejects.toBeInstanceOf(NfcBraceletNotActiveError)
  })

  it('throws generic Error on non-404 errors', async () => {
    const get = vi.fn().mockResolvedValue({ data: null, error: { status: 500, message: 'server error' } })
    const adapter = new NfcHttpAdapter(makeClient(get))
    await expect(adapter.getByNfcId('x')).rejects.toThrow('server error')
  })
})
