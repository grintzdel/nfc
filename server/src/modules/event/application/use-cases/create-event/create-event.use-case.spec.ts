import { createEventPropsFixture } from '../../../__tests__/event.factory'
import { EventRepositoryMock } from '../../../__tests__/event.repository.mock'
import { CreateEventUseCase } from './create-event.use-case'

describe('CreateEventUseCase', () => {
  it('creates and persists event', async () => {
    const repo = new EventRepositoryMock()
    const useCase = new CreateEventUseCase(repo)
    const { name, description, venueName, venueAddress, city, startsAt, endsAt, capacity, staffCount, ownerId } =
      createEventPropsFixture()
    const event = await useCase.execute({
      name,
      description,
      venueName,
      venueAddress,
      city,
      startsAt,
      endsAt,
      capacity,
      staffCount,
      ownerId,
    })
    expect(event.name).toBe(name)
    expect(repo.create_calledWith).not.toBeNull()
  })
})
