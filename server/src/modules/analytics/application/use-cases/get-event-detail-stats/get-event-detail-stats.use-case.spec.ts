import { BraceletRepositoryMock } from '@modules/bracelet/__tests__/bracelet.repository.mock'
import { createCheckInFixture } from '@modules/check-in/__tests__/check-in.factory'
import { CheckInRepositoryMock } from '@modules/check-in/__tests__/check-in.repository.mock'
import { createEventFixture } from '@modules/event/__tests__/event.factory'
import { EventRepositoryMock } from '@modules/event/__tests__/event.repository.mock'
import { EventNotFoundError } from '@modules/event/domain/errors/event.error'
import { ParticipantRepositoryMock } from '@modules/participant/__tests__/participant.repository.mock'

import { GetEventDetailStatsUseCase } from './get-event-detail-stats.use-case'

describe('GetEventDetailStatsUseCase', () => {
  let eventRepo: EventRepositoryMock
  let participantRepo: ParticipantRepositoryMock
  let braceletRepo: BraceletRepositoryMock
  let checkInRepo: CheckInRepositoryMock
  let useCase: GetEventDetailStatsUseCase

  beforeEach(() => {
    eventRepo = new EventRepositoryMock()
    participantRepo = new ParticipantRepositoryMock()
    braceletRepo = new BraceletRepositoryMock()
    checkInRepo = new CheckInRepositoryMock()
    useCase = new GetEventDetailStatsUseCase(eventRepo, participantRepo, braceletRepo, checkInRepo)
  })

  it('returns an all-zeros baseline when the event has no related data', async () => {
    eventRepo.findById_result = createEventFixture({ id: 'e1', capacity: 500 })

    const result = await useCase.execute('e1')

    expect(result).toEqual({
      participantCount: 0,
      capacity: 500,
      capacityFillRate: 0,
      braceletsAttachedCount: 0,
      braceletsActiveCount: 0,
      checkInCount: 0,
      uniqueParticipantsCheckedIn: 0,
      lastCheckInAt: null,
    })
  })

  it('throws EventNotFoundError when the event does not exist', async () => {
    eventRepo.findById_result = null
    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(EventNotFoundError)
  })

  it('throws EventNotFoundError when the event is soft-deleted', async () => {
    eventRepo.findById_result = createEventFixture({ id: 'e1', deletedAt: new Date() })
    await expect(useCase.execute('e1')).rejects.toBeInstanceOf(EventNotFoundError)
  })

  it('returns 0 capacityFillRate when capacity is 0 (no division by zero)', async () => {
    eventRepo.findById_result = createEventFixture({ id: 'e1', capacity: 0 })
    participantRepo.countByEventId_result = 5

    const result = await useCase.execute('e1')

    expect(result.capacityFillRate).toBe(0)
    expect(result.participantCount).toBe(5)
  })

  it('computes uniqueParticipantsCheckedIn from distinct braceletIds in check-ins', async () => {
    eventRepo.findById_result = createEventFixture({ id: 'e1', capacity: 100 })
    checkInRepo.findAllByEventId_result = [
      createCheckInFixture({ braceletId: 'b1', eventId: 'e1' }),
      createCheckInFixture({ braceletId: 'b1', eventId: 'e1' }),
      createCheckInFixture({ braceletId: 'b2', eventId: 'e1' }),
      createCheckInFixture({ braceletId: 'b3', eventId: 'e1' }),
    ]

    const result = await useCase.execute('e1')

    expect(result.uniqueParticipantsCheckedIn).toBe(3)
  })

  it('returns the latest check-in createdAt as lastCheckInAt (ISO string)', async () => {
    eventRepo.findById_result = createEventFixture({ id: 'e1', capacity: 100 })
    const oldest = new Date('2026-05-01T10:00:00.000Z')
    const middle = new Date('2026-05-05T12:00:00.000Z')
    const latest = new Date('2026-05-10T18:30:00.000Z')
    checkInRepo.findAllByEventId_result = [
      createCheckInFixture({ braceletId: 'b1', eventId: 'e1', createdAt: middle }),
      createCheckInFixture({ braceletId: 'b2', eventId: 'e1', createdAt: latest }),
      createCheckInFixture({ braceletId: 'b3', eventId: 'e1', createdAt: oldest }),
    ]

    const result = await useCase.execute('e1')

    expect(result.lastCheckInAt).toBe(latest.toISOString())
  })

  it('returns a populated stats block for a typical event', async () => {
    eventRepo.findById_result = createEventFixture({ id: 'e1', capacity: 200 })
    participantRepo.countByEventId_result = 50
    braceletRepo.countByEventId_result = 40
    braceletRepo.countByEventIdAndStatus_result = 35
    checkInRepo.countByEventId_result = 120
    checkInRepo.findAllByEventId_result = [
      createCheckInFixture({ braceletId: 'b1', eventId: 'e1' }),
      createCheckInFixture({ braceletId: 'b2', eventId: 'e1' }),
    ]

    const result = await useCase.execute('e1')

    expect(result.participantCount).toBe(50)
    expect(result.capacity).toBe(200)
    expect(result.capacityFillRate).toBeCloseTo(0.25)
    expect(result.braceletsAttachedCount).toBe(40)
    expect(result.braceletsActiveCount).toBe(35)
    expect(result.checkInCount).toBe(120)
    expect(result.uniqueParticipantsCheckedIn).toBe(2)
  })
})
