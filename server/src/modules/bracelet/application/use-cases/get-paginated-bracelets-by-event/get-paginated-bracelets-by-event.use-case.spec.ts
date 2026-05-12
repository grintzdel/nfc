import { GetPaginatedBraceletsByEventUseCase } from './get-paginated-bracelets-by-event.use-case'
import { BraceletRepositoryMock } from '../../../__tests__/bracelet.repository.mock'
import { ParticipantRepositoryMock } from '@modules/participant/__tests__/participant.repository.mock'
import { createBraceletFixture } from '../../../__tests__/bracelet.factory'
import { createParticipantFixture } from '@modules/participant/__tests__/participant.factory'

describe('GetPaginatedBraceletsByEventUseCase', () => {
  let braceletRepo: BraceletRepositoryMock
  let participantRepo: ParticipantRepositoryMock
  let useCase: GetPaginatedBraceletsByEventUseCase

  beforeEach(() => {
    braceletRepo = new BraceletRepositoryMock()
    participantRepo = new ParticipantRepositoryMock()
    useCase = new GetPaginatedBraceletsByEventUseCase(braceletRepo, participantRepo)
  })

  it('returns an empty page when no bracelets match', async () => {
    braceletRepo.findPaginatedByEventId_result = { items: [], total: 0, page: 1, limit: 20, totalPages: 0 }

    const result = await useCase.execute({ eventId: 'e1', page: 1, limit: 20 })

    expect(result).toEqual({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 })
  })

  it('passes pagination + search to the repo', async () => {
    braceletRepo.findPaginatedByEventId_result = { items: [], total: 0, page: 1, limit: 20, totalPages: 0 }

    await useCase.execute({ eventId: 'e1', page: 3, limit: 50, search: 'nfc-' })

    expect(braceletRepo.findPaginatedByEventId_calledWith).toEqual({
      eventId: 'e1', page: 3, limit: 50, search: 'nfc-',
    })
  })

  it('clamps limit and page', async () => {
    braceletRepo.findPaginatedByEventId_result = { items: [], total: 0, page: 1, limit: 100, totalPages: 0 }

    await useCase.execute({ eventId: 'e1', page: -2, limit: 9999 })
    expect(braceletRepo.findPaginatedByEventId_calledWith?.page).toBe(1)
    expect(braceletRepo.findPaginatedByEventId_calledWith?.limit).toBe(100)

    await useCase.execute({ eventId: 'e1', page: 1, limit: 0 })
    expect(braceletRepo.findPaginatedByEventId_calledWith?.limit).toBe(1)
  })

  it('attaches the matching participant to each bracelet (or null)', async () => {
    const b1 = createBraceletFixture({ id: 'b1' })
    const b2 = createBraceletFixture({ id: 'b2' })
    const b3 = createBraceletFixture({ id: 'b3' })
    const p1 = createParticipantFixture({ id: 'p1', braceletId: 'b1' })
    const p3 = createParticipantFixture({ id: 'p3', braceletId: 'b3' })

    braceletRepo.findPaginatedByEventId_result = { items: [b1, b2, b3], total: 3, page: 1, limit: 20, totalPages: 1 }
    participantRepo.findAllByEventId_result = [p1, p3]

    const result = await useCase.execute({ eventId: 'e1', page: 1, limit: 20 })

    expect(result.items[0]).toEqual({ bracelet: b1, participant: p1 })
    expect(result.items[1]).toEqual({ bracelet: b2, participant: null })
    expect(result.items[2]).toEqual({ bracelet: b3, participant: p3 })
  })
})
