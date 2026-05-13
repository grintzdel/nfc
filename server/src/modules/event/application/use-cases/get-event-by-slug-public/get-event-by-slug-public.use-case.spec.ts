import { ParticipantRepositoryMock } from '@modules/participant/__tests__/participant.repository.mock'
import { AppError } from '@shared/errors/app.error'

import { createEventFixture } from '../../../__tests__/event.factory'
import { EventRepositoryMock } from '../../../__tests__/event.repository.mock'
import { EventStatus } from '../../../domain/constants/event-status.constant'
import { EventNotFoundError } from '../../../domain/errors/event.error'
import { GetEventBySlugPublicUseCase } from './get-event-by-slug-public.use-case'

describe('GetEventBySlugPublicUseCase', () => {
  let eventRepo: EventRepositoryMock
  let participantRepo: ParticipantRepositoryMock
  let useCase: GetEventBySlugPublicUseCase

  beforeEach(() => {
    eventRepo = new EventRepositoryMock()
    participantRepo = new ParticipantRepositoryMock()
    useCase = new GetEventBySlugPublicUseCase(eventRepo, participantRepo)
  })

  it('returns event + participantCount when status is upcoming', async () => {
    eventRepo.findBySlug_result = createEventFixture({ id: 'e1', status: EventStatus.UPCOMING })
    participantRepo.countByEventId_result = 42

    const result = await useCase.execute('any-slug')

    expect(result.event.id).toBe('e1')
    expect(result.event.isUpcoming()).toBe(true)
    expect(result.participantCount).toBe(42)
  })

  it('returns event when status is in_progress', async () => {
    eventRepo.findBySlug_result = createEventFixture({ status: EventStatus.IN_PROGRESS })
    participantRepo.countByEventId_result = 7
    const result = await useCase.execute('any-slug')
    expect(result.event.isInProgress()).toBe(true)
    expect(result.participantCount).toBe(7)
  })

  it('throws AppError 404 when status is draft', async () => {
    eventRepo.findBySlug_result = createEventFixture({ status: EventStatus.DRAFT })
    await expect(useCase.execute('any-slug')).rejects.toBeInstanceOf(AppError)
  })

  it('throws AppError 404 when status is completed', async () => {
    eventRepo.findBySlug_result = createEventFixture({ status: EventStatus.COMPLETED })
    await expect(useCase.execute('any-slug')).rejects.toBeInstanceOf(AppError)
  })

  it('throws EventNotFoundError when slug not found', async () => {
    eventRepo.findBySlug_result = null
    await expect(useCase.execute('missing-slug')).rejects.toBeInstanceOf(EventNotFoundError)
  })

  it('throws EventNotFoundError when soft-deleted', async () => {
    const e = createEventFixture({ status: EventStatus.UPCOMING })
    e.softDelete()
    eventRepo.findBySlug_result = e
    await expect(useCase.execute('slug')).rejects.toBeInstanceOf(EventNotFoundError)
  })
})
