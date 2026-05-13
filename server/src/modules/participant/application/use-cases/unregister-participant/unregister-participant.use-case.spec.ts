import { AppError } from '@shared/errors/app.error'

import { ParticipantRepositoryMock } from '../../../__tests__/participant.repository.mock'
import { ParticipantEntity } from '../../../domain/entity/participant.entity'
import { ParticipantNotFoundError } from '../../../domain/errors/participant.error'
import { UnregisterParticipantUseCase } from './unregister-participant.use-case'

function makeParticipant(userId = 'owner-1'): ParticipantEntity {
  return ParticipantEntity.fromProps({
    id: 'p-1',
    userId,
    eventId: 'event-1',
    braceletId: null,
    profile: { displayName: 'Alice', role: null, bio: null, links: [] },
    registeredAt: new Date(),
    checkedInAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  })
}

describe('UnregisterParticipantUseCase', () => {
  let mockRepository: ParticipantRepositoryMock
  let useCase: UnregisterParticipantUseCase

  beforeEach(() => {
    mockRepository = new ParticipantRepositoryMock()
    useCase = new UnregisterParticipantUseCase(mockRepository)
  })

  it('should soft-delete the participant when caller is the owner', async () => {
    mockRepository.findById_result = makeParticipant('owner-1')
    await useCase.execute('p-1', 'owner-1')
    expect(mockRepository.softDelete_calledWith).toBe('p-1')
  })

  it('should throw 403 when caller is not the owner', async () => {
    mockRepository.findById_result = makeParticipant('owner-1')
    await expect(useCase.execute('p-1', 'someone-else')).rejects.toBeInstanceOf(AppError)
  })

  it('should soft-delete when caller is admin even if not the owner', async () => {
    mockRepository.findById_result = makeParticipant('owner-1')
    await useCase.execute('p-1', 'admin-1', true)
    expect(mockRepository.softDelete_calledWith).toBe('p-1')
  })

  it('should throw ParticipantNotFoundError when participant missing', async () => {
    mockRepository.findById_result = null
    await expect(useCase.execute('p-1', 'owner-1')).rejects.toBeInstanceOf(ParticipantNotFoundError)
  })
})
