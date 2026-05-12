import { CreateEventUseCase } from './create-event.use-case'
import { EventRepositoryMock } from '../../../__tests__/event.repository.mock'
import { createEventPropsFixture } from '../../../__tests__/event.factory'

describe('CreateEventUseCase', () => {
  it('creates and persists event', async () => {
    const repo = new EventRepositoryMock()
    const useCase = new CreateEventUseCase(repo)
    const { name, description, venueName, venueAddress, city, startsAt, endsAt, capacity, staffCount, ownerId } = createEventPropsFixture()
    const event = await useCase.execute({ name, description, venueName, venueAddress, city, startsAt, endsAt, capacity, staffCount, ownerId })
    expect(event.name).toBe(name)
    expect(repo.create_calledWith).not.toBeNull()
  })
})
