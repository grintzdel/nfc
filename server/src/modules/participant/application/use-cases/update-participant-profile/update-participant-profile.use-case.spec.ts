import { UpdateParticipantProfileUseCase } from './update-participant-profile.use-case'
import { ParticipantRepositoryMock } from '../../../__tests__/participant.repository.mock'
import { ParticipantEntity } from '../../../domain/entity/participant.entity'
import { ProfileLinkType } from '../../../domain/constants/profile-link-type.constant'
import { ParticipantNotFoundError } from '../../../domain/errors/participant.error'
import { AppError } from '@shared/errors/app.error'

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

describe('UpdateParticipantProfileUseCase', () => {
  let mockRepository: ParticipantRepositoryMock
  let useCase: UpdateParticipantProfileUseCase

  beforeEach(() => {
    mockRepository = new ParticipantRepositoryMock()
    useCase = new UpdateParticipantProfileUseCase(mockRepository)
  })

  it('should update profile when caller is the owner', async () => {
    const participant = makeParticipant('owner-1')
    mockRepository.findById_result = participant
    mockRepository.update_result = participant

    const result = await useCase.execute('p-1', 'owner-1', {
      displayName: 'Bob',
      links: [{ type: ProfileLinkType.LINKEDIN, url: 'https://linkedin.com/in/bob', label: null }],
    })
    expect(result.profile.displayName).toBe('Bob')
    expect(result.profile.links).toHaveLength(1)
  })

  it('should throw 403 when caller is not the owner', async () => {
    mockRepository.findById_result = makeParticipant('owner-1')
    await expect(useCase.execute('p-1', 'someone-else', { displayName: 'Bob' })).rejects.toBeInstanceOf(AppError)
  })

  it('should throw ParticipantNotFoundError when participant missing', async () => {
    mockRepository.findById_result = null
    await expect(useCase.execute('p-1', 'owner-1', { displayName: 'Bob' })).rejects.toBeInstanceOf(
      ParticipantNotFoundError,
    )
  })
})
