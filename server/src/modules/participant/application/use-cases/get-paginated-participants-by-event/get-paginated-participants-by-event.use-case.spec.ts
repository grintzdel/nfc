import { GetPaginatedParticipantsByEventUseCase } from './get-paginated-participants-by-event.use-case'
import { ParticipantRepositoryMock } from '../../../__tests__/participant.repository.mock'
import { BraceletRepositoryMock } from '@modules/bracelet/__tests__/bracelet.repository.mock'
import { createParticipantFixture } from '../../../__tests__/participant.factory'
import { createBraceletFixture } from '@modules/bracelet/__tests__/bracelet.factory'

describe('GetPaginatedParticipantsByEventUseCase', () => {
  let participantRepo: ParticipantRepositoryMock
  let braceletRepo: BraceletRepositoryMock
  let useCase: GetPaginatedParticipantsByEventUseCase

  beforeEach(() => {
    participantRepo = new ParticipantRepositoryMock()
    braceletRepo = new BraceletRepositoryMock()
    useCase = new GetPaginatedParticipantsByEventUseCase(participantRepo, braceletRepo)
  })

  it('returns an empty page when no participants match', async () => {
    participantRepo.findPaginatedByEventId_result = { items: [], total: 0, page: 1, limit: 20, totalPages: 0 }

    const result = await useCase.execute({ eventId: 'e1', page: 1, limit: 20 })

    expect(result).toEqual({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 })
    expect(braceletRepo.findAllByIds_calledWith).toBeNull()
  })

  it('passes pagination params + search through to the repo', async () => {
    participantRepo.findPaginatedByEventId_result = { items: [], total: 0, page: 2, limit: 50, totalPages: 0 }

    await useCase.execute({ eventId: 'e1', page: 2, limit: 50, search: 'marie' })

    expect(participantRepo.findPaginatedByEventId_calledWith).toEqual({
      eventId: 'e1', page: 2, limit: 50, search: 'marie',
    })
  })

  it('clamps limit into [1, 100]', async () => {
    participantRepo.findPaginatedByEventId_result = { items: [], total: 0, page: 1, limit: 100, totalPages: 0 }

    await useCase.execute({ eventId: 'e1', page: 1, limit: 9999 })
    expect(participantRepo.findPaginatedByEventId_calledWith?.limit).toBe(100)

    await useCase.execute({ eventId: 'e1', page: 1, limit: 0 })
    expect(participantRepo.findPaginatedByEventId_calledWith?.limit).toBe(1)
  })

  it('clamps page to >= 1', async () => {
    participantRepo.findPaginatedByEventId_result = { items: [], total: 0, page: 1, limit: 20, totalPages: 0 }

    await useCase.execute({ eventId: 'e1', page: -3, limit: 20 })
    expect(participantRepo.findPaginatedByEventId_calledWith?.page).toBe(1)
  })

  it('attaches a bracelet summary to participants who have a braceletId', async () => {
    const p1 = createParticipantFixture({ id: 'p1', braceletId: 'b1' })
    const p2 = createParticipantFixture({ id: 'p2', braceletId: null })
    const p3 = createParticipantFixture({ id: 'p3', braceletId: 'b3' })
    const b1 = createBraceletFixture({ id: 'b1', nfcId: 'nfc-001' })
    const b3 = createBraceletFixture({ id: 'b3', nfcId: 'nfc-003' })

    participantRepo.findPaginatedByEventId_result = {
      items: [p1, p2, p3],
      total: 3, page: 1, limit: 20, totalPages: 1,
    }
    braceletRepo.findAllByIds_result = [b1, b3]

    const result = await useCase.execute({ eventId: 'e1', page: 1, limit: 20 })

    expect(braceletRepo.findAllByIds_calledWith).toEqual(['b1', 'b3'])
    expect(result.items).toHaveLength(3)
    expect(result.items[0]).toEqual({ participant: p1, bracelet: b1 })
    expect(result.items[1]).toEqual({ participant: p2, bracelet: null })
    expect(result.items[2]).toEqual({ participant: p3, bracelet: b3 })
  })

  it('skips the bracelet repo call when no participant has a braceletId', async () => {
    const p1 = createParticipantFixture({ braceletId: null })
    participantRepo.findPaginatedByEventId_result = { items: [p1], total: 1, page: 1, limit: 20, totalPages: 1 }

    const result = await useCase.execute({ eventId: 'e1', page: 1, limit: 20 })

    expect(braceletRepo.findAllByIds_calledWith).toBeNull()
    expect(result.items[0]).toEqual({ participant: p1, bracelet: null })
  })
})
