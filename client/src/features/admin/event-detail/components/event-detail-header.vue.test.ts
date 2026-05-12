import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import EventDetailHeader from './event-detail-header.vue'
import { EventStatus } from '@/modules/event/core/model/event.domain-model'
import type { EventDomainModel } from '@/modules/event/core/model/event.domain-model'
import type { AnalyticsDomainModel } from '@/modules/analytics/core/model/analytics.domain-model'

function makeEvent(status: EventStatus): EventDomainModel.EventOverviewDto {
  return {
    id: 'e1',
    name: 'Demo Event',
    slug: 'demo',
    description: '',
    venueName: 'Station F',
    venueAddress: '5 Parvis Alan Turing',
    city: 'Paris',
    startsAt: '2026-06-01T10:00:00.000Z',
    endsAt: '2026-06-01T18:00:00.000Z',
    capacity: 100,
    staffCount: 5,
    status,
    ownerId: 'u1',
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
  }
}

const stats: AnalyticsDomainModel.EventDetailStatsDto = {
  participantCount: 25,
  capacity: 100,
  capacityFillRate: 0.25,
  braceletsAttachedCount: 20,
  braceletsActiveCount: 18,
  checkInCount: 60,
  uniqueParticipantsCheckedIn: 12,
  lastCheckInAt: null,
}

function buttonsOf(status: EventStatus): string[] {
  const wrapper = mount(EventDetailHeader, {
    props: { event: makeEvent(status), stats },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
  return wrapper.findAll('button').map((b) => b.text())
}

describe('EventDetailHeader — state machine', () => {
  const cases: Array<[EventStatus, string[]]> = [
    [EventStatus.DRAFT, ['Publier']],
    [EventStatus.UPCOMING, ['Démarrer', 'Annuler']],
    [EventStatus.IN_PROGRESS, ['Clôturer']],
    [EventStatus.COMPLETED, []],
    [EventStatus.CANCELLED, []],
  ]
  for (const [status, expected] of cases) {
    it(`renders ${expected.length === 0 ? 'no action' : expected.join(' + ')} for status=${status}`, () => {
      expect(buttonsOf(status)).toEqual(expected)
    })
  }

  it('emits the action key when a button is clicked', async () => {
    const wrapper = mount(EventDetailHeader, {
      props: { event: makeEvent(EventStatus.UPCOMING), stats },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('action')).toEqual([['cancel']])
  })
})
