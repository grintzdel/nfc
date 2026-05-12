import { EventEntity } from '../../../domain/entity/event.entity'
import { IEventRepository } from '../../../domain/repository/event.repository.interface'
import { EventNotFoundError } from '../../../domain/errors/event.error'
import { AppError } from '@shared/errors/app.error'

export class GetEventBySlugPublicUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(slug: string): Promise<EventEntity> {
    const event = await this.eventRepository.findBySlug(slug)
    if (!event || event.isDeleted()) throw new EventNotFoundError(slug)
    if (!event.isUpcoming() && !event.isInProgress()) throw new AppError(404, 'Event not available')
    return event
  }
}
