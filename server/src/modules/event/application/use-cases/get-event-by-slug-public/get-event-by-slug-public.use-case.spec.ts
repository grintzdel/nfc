import { GetEventBySlugPublicUseCase } from './get-event-by-slug-public.use-case'
import { EventRepositoryMock } from '../../../__tests__/event.repository.mock'
import { createEventFixture } from '../../../__tests__/event.factory'
import { EventStatus } from '../../../domain/constants/event-status.constant'
import { EventNotFoundError } from '../../../domain/errors/event.error'
import { AppError } from '@shared/errors/app.error'

describe('GetEventBySlugPublicUseCase', () => {
  let mockRepository: EventRepositoryMock
  let useCase: GetEventBySlugPublicUseCase

  beforeEach(() => {
    mockRepository = new EventRepositoryMock()
    useCase = new GetEventBySlugPublicUseCase(mockRepository)
  })

  it('returns event when status is upcoming', async () => {
    mockRepository.findBySlug_result = createEventFixture({ status: EventStatus.UPCOMING })
    const result = await useCase.execute('any-slug')
    expect(result.isUpcoming()).toBe(true)
  })

  it('returns event when status is in_progress', async () => {
    mockRepository.findBySlug_result = createEventFixture({ status: EventStatus.IN_PROGRESS })
    const result = await useCase.execute('any-slug')
    expect(result.isInProgress()).toBe(true)
  })

  it('throws AppError 404 when status is draft', async () => {
    mockRepository.findBySlug_result = createEventFixture({ status: EventStatus.DRAFT })
    await expect(useCase.execute('any-slug')).rejects.toBeInstanceOf(AppError)
  })

  it('throws AppError 404 when status is completed', async () => {
    mockRepository.findBySlug_result = createEventFixture({ status: EventStatus.COMPLETED })
    await expect(useCase.execute('any-slug')).rejects.toBeInstanceOf(AppError)
  })

  it('throws EventNotFoundError when slug not found', async () => {
    mockRepository.findBySlug_result = null
    await expect(useCase.execute('missing-slug')).rejects.toBeInstanceOf(EventNotFoundError)
  })

  it('throws EventNotFoundError when soft-deleted', async () => {
    const e = createEventFixture({ status: EventStatus.UPCOMING })
    e.softDelete()
    mockRepository.findBySlug_result = e
    await expect(useCase.execute('slug')).rejects.toBeInstanceOf(EventNotFoundError)
  })
})
