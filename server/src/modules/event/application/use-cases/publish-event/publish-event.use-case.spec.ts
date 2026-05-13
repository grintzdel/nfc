import { createEventFixture } from '../../../__tests__/event.factory'
import { EventRepositoryMock } from '../../../__tests__/event.repository.mock'
import { EventStatus } from '../../../domain/constants/event-status.constant'
import { EventNotFoundError, EventNotOwnerError } from '../../../domain/errors/event.error'
import { PublishEventUseCase } from './publish-event.use-case'

describe('PublishEventUseCase', () => {
  it('publishes draft event', async () => {
    const repo = new EventRepositoryMock()
    const event = createEventFixture({ ownerId: 'user-1', status: EventStatus.DRAFT })
    repo.findById_result = event
    const useCase = new PublishEventUseCase(repo)
    const result = await useCase.execute(event.id, 'user-1')
    expect(result.status).toBe(EventStatus.UPCOMING)
  })

  it('throws EventNotFoundError if missing', async () => {
    const repo = new EventRepositoryMock()
    repo.findById_result = null
    const useCase = new PublishEventUseCase(repo)
    await expect(useCase.execute('missing', 'user-1')).rejects.toThrow(EventNotFoundError)
  })

  it('throws EventNotOwnerError if wrong user', async () => {
    const repo = new EventRepositoryMock()
    repo.findById_result = createEventFixture({ ownerId: 'user-1' })
    const useCase = new PublishEventUseCase(repo)
    await expect(useCase.execute('x', 'user-2')).rejects.toThrow(EventNotOwnerError)
  })
})
