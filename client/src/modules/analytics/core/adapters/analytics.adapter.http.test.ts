import { describe, it, expect, vi } from 'vitest'

import type { HttpClient } from '@/modules/shared/http/http-client'

import { AnalyticsHttpAdapter } from './analytics.adapter.http'

function makeClient(get: ReturnType<typeof vi.fn>): HttpClient {
  return { get } as unknown as HttpClient
}

describe('AnalyticsHttpAdapter — getEventDetailStats', () => {
  it('GETs /admin-stats/events/:eventId and returns the unwrapped DTO', async () => {
    const stats = {
      participantCount: 25,
      capacity: 100,
      capacityFillRate: 0.25,
      braceletsAttachedCount: 10,
      braceletsActiveCount: 8,
      checkInCount: 60,
      uniqueParticipantsCheckedIn: 12,
      lastCheckInAt: '2026-05-10T18:00:00.000Z',
    }
    const get = vi.fn().mockResolvedValue({ data: { data: stats }, error: null })
    const adapter = new AnalyticsHttpAdapter(makeClient(get))

    const result = await adapter.getEventDetailStats('e1')

    expect(get).toHaveBeenCalledWith('/admin-stats/events/e1')
    expect(result).toEqual(stats)
  })

  it('throws when the HTTP layer returns an error', async () => {
    const get = vi.fn().mockResolvedValue({ data: null, error: { status: 500, message: 'boom' } })
    const adapter = new AnalyticsHttpAdapter(makeClient(get))

    await expect(adapter.getEventDetailStats('e1')).rejects.toThrow('boom')
  })
})
