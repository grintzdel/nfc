import { RegisterParticipantUseCase } from './register-participant.use-case'
import { ParticipantRepositoryMock } from '../../../__tests__/participant.repository.mock'
import { createParticipantFixture } from '../../../__tests__/participant.factory'
import { EventRepositoryMock } from '@modules/event/__tests__/event.repository.mock'
import { createEventFixture } from '@modules/event/__tests__/event.factory'
import { EventStatus } from '@modules/event/domain/constants/event-status.constant'
import { EventFullError, EventNotFoundError } from '@modules/event/domain/errors/event.error'
import { ParticipantAlreadyRegisteredError } from '../../../domain/errors/participant.error'
import { AppError } from '@shared/errors/app.error'

describe('RegisterParticipantUseCase', () => {
  let useCase: RegisterParticipantUseCase
  let participantRepo: ParticipantRepositoryMock
  let eventRepo: EventRepositoryMock

  const validInput = {
    userId: 'user-1',
    eventId: 'event-1',
    profile: { displayName: 'Alice', role: null as Nullable<string>, bio: null as Nullable<string>, links: [] },
  }

  beforeEach(() => {
    participantRepo = new ParticipantRepositoryMock()
    eventRepo = new EventRepositoryMock()
    useCase = new RegisterParticipantUseCase(participantRepo, eventRepo)
  })

  it('should register a participant when event exists and no existing registration', async () => {
    eventRepo.findById_result = createEventFixture({ status: EventStatus.DRAFT })
    participantRepo.findByUserAndEvent_result = null

    const result = await useCase.execute(validInput)

    expect(result).toBeDefined()
    expect(participantRepo.create_calledWith).not.toBeNull()
    expect(participantRepo.create_calledWith!.userId).toBe('user-1')
    expect(participantRepo.create_calledWith!.eventId).toBe('event-1')
  })

  it('should throw EventNotFoundError if event does not exist', async () => {
    eventRepo.findById_result = null

    await expect(useCase.execute(validInput)).rejects.toThrow(EventNotFoundError)
  })

  it('should throw AppError(400) if event is completed', async () => {
    eventRepo.findById_result = createEventFixture({ status: EventStatus.COMPLETED })

    await expect(useCase.execute(validInput)).rejects.toThrow(AppError)
    await expect(useCase.execute(validInput)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('should throw AppError(400) if event is cancelled', async () => {
    eventRepo.findById_result = createEventFixture({ status: EventStatus.CANCELLED })

    await expect(useCase.execute(validInput)).rejects.toThrow(AppError)
    await expect(useCase.execute(validInput)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('should throw ParticipantAlreadyRegisteredError if user is already registered', async () => {
    eventRepo.findById_result = createEventFixture({ status: EventStatus.DRAFT })
    participantRepo.findByUserAndEvent_result = createParticipantFixture({
      userId: 'user-1',
      eventId: 'event-1',
    })

    await expect(useCase.execute(validInput)).rejects.toThrow(ParticipantAlreadyRegisteredError)
  })

  it('should throw EventFullError when event is at capacity', async () => {
    eventRepo.findById_result = createEventFixture({ status: EventStatus.UPCOMING, capacity: 100 })
    participantRepo.findByUserAndEvent_result = null
    participantRepo.countByEventId_result = 100

    await expect(useCase.execute(validInput)).rejects.toThrow(EventFullError)
  })

  it('should allow registration when event has capacity left', async () => {
    eventRepo.findById_result = createEventFixture({ status: EventStatus.UPCOMING, capacity: 100 })
    participantRepo.findByUserAndEvent_result = null
    participantRepo.countByEventId_result = 99

    const result = await useCase.execute(validInput)
    expect(result).toBeDefined()
  })

  it('should skip capacity check when capacity is 0 (no limit)', async () => {
    eventRepo.findById_result = createEventFixture({ status: EventStatus.UPCOMING, capacity: 0 })
    participantRepo.findByUserAndEvent_result = null
    participantRepo.countByEventId_result = 9999

    const result = await useCase.execute(validInput)
    expect(result).toBeDefined()
  })
})
