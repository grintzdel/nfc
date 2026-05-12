import { GetPaginatedCheckInsByEventUseCase } from './get-paginated-check-ins-by-event.use-case'
import { CheckInRepositoryMock } from '../../../__tests__/check-in.repository.mock'
import { ParticipantRepositoryMock } from '@modules/participant/__tests__/participant.repository.mock'
import { createCheckInFixture } from '../../../__tests__/check-in.factory'
import { createParticipantFixture } from '@modules/participant/__tests__/participant.factory'

describe('GetPaginatedCheckInsByEventUseCase', () => {
  let checkInRepo: CheckInRepositoryMock
  let participantRepo: ParticipantRepositoryMock
  let useCase: GetPaginatedCheckInsByEventUseCase

  beforeEach(() => {
    checkInRepo = new CheckInRepositoryMock()
    participantRepo = new ParticipantRepositoryMock()
    useCase = new GetPaginatedCheckInsByEventUseCase(checkInRepo, participantRepo)
  })

  it('returns an empty page when no check-ins match', async () => {
    checkInRepo.findPaginatedByEventId_result = { items: [], total: 0, page: 1, limit: 20, totalPages: 0 }

    const result = await useCase.execute({ eventId: 'e1', page: 1, limit: 20 })

    expect(result).toEqual({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 })
  })

  it('passes pagination params to the repo', async () => {
    checkInRepo.findPaginatedByEventId_result = { items: [], total: 0, page: 3, limit: 50, totalPages: 0 }

    await useCase.execute({ eventId: 'e1', page: 3, limit: 50 })

    expect(checkInRepo.findPaginatedByEventId_calledWith).toEqual({ eventId: 'e1', page: 3, limit: 50 })
  })

  it('clamps limit and page', async () => {
    checkInRepo.findPaginatedByEventId_result = { items: [], total: 0, page: 1, limit: 100, totalPages: 0 }

    await useCase.execute({ eventId: 'e1', page: -1, limit: 9999 })
    expect(checkInRepo.findPaginatedByEventId_calledWith?.page).toBe(1)
    expect(checkInRepo.findPaginatedByEventId_calledWith?.limit).toBe(100)
  })

  it('resolves participant via braceletId (or null when no participant matches)', async () => {
    const c1 = createCheckInFixture({ id: 'c1', braceletId: 'b1', eventId: 'e1' })
    const c2 = createCheckInFixture({ id: 'c2', braceletId: 'b2', eventId: 'e1' })
    const c3 = createCheckInFixture({ id: 'c3', braceletId: 'b1', eventId: 'e1' })
    const p1 = createParticipantFixture({ id: 'p1', braceletId: 'b1' })

    checkInRepo.findPaginatedByEventId_result = { items: [c1, c2, c3], total: 3, page: 1, limit: 20, totalPages: 1 }
    participantRepo.findAllByEventId_result = [p1]

    const result = await useCase.execute({ eventId: 'e1', page: 1, limit: 20 })

    expect(result.items[0]).toEqual({ checkIn: c1, participant: p1 })
    expect(result.items[1]).toEqual({ checkIn: c2, participant: null })
    expect(result.items[2]).toEqual({ checkIn: c3, participant: p1 })
  })
})
