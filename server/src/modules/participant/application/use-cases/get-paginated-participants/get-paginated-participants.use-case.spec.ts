import { GetPaginatedParticipantsUseCase } from './get-paginated-participants.use-case'
import { ParticipantRepositoryMock } from '../../../__tests__/participant.repository.mock'
import { EventRepositoryMock } from '@modules/event/__tests__/event.repository.mock'
import { createParticipantFixture } from '../../../__tests__/participant.factory'
import { createEventFixture } from '@modules/event/__tests__/event.factory'

describe('GetPaginatedParticipantsUseCase', () => {
  let participantRepo: ParticipantRepositoryMock
  let eventRepo: EventRepositoryMock
  let useCase: GetPaginatedParticipantsUseCase

  beforeEach(() => {
    participantRepo = new ParticipantRepositoryMock()
    eventRepo = new EventRepositoryMock()
    useCase = new GetPaginatedParticipantsUseCase(participantRepo, eventRepo)
  })

  it('returns an empty page when no participants match', async () => {
    participantRepo.findPaginated_result = { items: [], total: 0, page: 1, limit: 20, totalPages: 0 }

    const result = await useCase.execute({ page: 1, limit: 20 })

    expect(result).toEqual({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 })
    expect(eventRepo.findAllByIds_calledWith).toBeNull()
  })

  it('passes params through to the repo', async () => {
    participantRepo.findPaginated_result = { items: [], total: 0, page: 2, limit: 50, totalPages: 0 }

    await useCase.execute({ page: 2, limit: 50, checkedIn: true, search: 'marie' })

    expect(participantRepo.findPaginated_calledWith).toEqual({
      page: 2, limit: 50, checkedIn: true, search: 'marie',
    })
  })

  it('clamps page and limit', async () => {
    participantRepo.findPaginated_result = { items: [], total: 0, page: 1, limit: 100, totalPages: 0 }

    await useCase.execute({ page: -3, limit: 9999 })
    expect(participantRepo.findPaginated_calledWith?.page).toBe(1)
    expect(participantRepo.findPaginated_calledWith?.limit).toBe(100)
  })

  it('attaches the event summary to each participant (or null when missing)', async () => {
    const p1 = createParticipantFixture({ id: 'p1', eventId: 'e1' })
    const p2 = createParticipantFixture({ id: 'p2', eventId: 'e2' })
    const e1 = createEventFixture({ id: 'e1', name: 'Event One' })

    participantRepo.findPaginated_result = { items: [p1, p2], total: 2, page: 1, limit: 20, totalPages: 1 }
    eventRepo.findAllByIds_result = [e1] // e2 missing (soft-deleted)

    const result = await useCase.execute({ page: 1, limit: 20 })

    expect(eventRepo.findAllByIds_calledWith).toEqual(['e1', 'e2'])
    expect(result.items[0]).toEqual({ participant: p1, event: e1 })
    expect(result.items[1]).toEqual({ participant: p2, event: null })
  })
})
