import { GetAvailableBraceletsUseCase } from './get-available-bracelets.use-case'
import { BraceletRepositoryMock } from '../../../__tests__/bracelet.repository.mock'
import { ParticipantRepositoryMock } from '@modules/participant/__tests__/participant.repository.mock'
import { createBraceletFixture } from '../../../__tests__/bracelet.factory'
import { createParticipantFixture } from '@modules/participant/__tests__/participant.factory'
import { BraceletStatus } from '../../../domain/constants/bracelet-status.constant'

describe('GetAvailableBraceletsUseCase', () => {
  let braceletRepo: BraceletRepositoryMock
  let participantRepo: ParticipantRepositoryMock
  let useCase: GetAvailableBraceletsUseCase

  beforeEach(() => {
    braceletRepo = new BraceletRepositoryMock()
    participantRepo = new ParticipantRepositoryMock()
    useCase = new GetAvailableBraceletsUseCase(braceletRepo, participantRepo)
  })

  it('queries PRE_ACTIVATED bracelets scoped to the event', async () => {
    braceletRepo.findAllByEventIdAndStatus_result = []
    await useCase.execute({ eventId: 'e1' })
    expect(braceletRepo.findAllByEventIdAndStatus_calledWith).toEqual({
      eventId: 'e1', status: BraceletStatus.PRE_ACTIVATED,
    })
  })

  it('excludes bracelets already referenced by a participant of the event', async () => {
    const b1 = createBraceletFixture({ id: 'b1', status: BraceletStatus.PRE_ACTIVATED })
    const b2 = createBraceletFixture({ id: 'b2', status: BraceletStatus.PRE_ACTIVATED })
    const b3 = createBraceletFixture({ id: 'b3', status: BraceletStatus.PRE_ACTIVATED })
    braceletRepo.findAllByEventIdAndStatus_result = [b1, b2, b3]
    participantRepo.findAllByEventId_result = [
      createParticipantFixture({ braceletId: 'b1' }),
      createParticipantFixture({ braceletId: null }),
      createParticipantFixture({ braceletId: 'b3' }),
    ]

    const result = await useCase.execute({ eventId: 'e1' })

    expect(result.map((b) => b.id)).toEqual(['b2'])
  })

  it('caps the result at 100', async () => {
    braceletRepo.findAllByEventIdAndStatus_result = Array.from({ length: 150 }, (_, i) =>
      createBraceletFixture({ id: `b${i}`, status: BraceletStatus.PRE_ACTIVATED }),
    )
    participantRepo.findAllByEventId_result = []

    const result = await useCase.execute({ eventId: 'e1' })

    expect(result).toHaveLength(100)
  })

  it('returns an empty array when no PRE_ACTIVATED bracelets exist for the event', async () => {
    braceletRepo.findAllByEventIdAndStatus_result = []
    participantRepo.findAllByEventId_result = []

    const result = await useCase.execute({ eventId: 'e1' })

    expect(result).toEqual([])
  })
})
