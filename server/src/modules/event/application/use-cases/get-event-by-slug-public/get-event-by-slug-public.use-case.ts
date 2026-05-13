import { IParticipantRepository } from '@modules/participant/domain/repository/participant.repository.interface'
import { AppError } from '@shared/errors/app.error'

import { EventEntity } from '../../../domain/entity/event.entity'
import { EventNotFoundError } from '../../../domain/errors/event.error'
import { IEventRepository } from '../../../domain/repository/event.repository.interface'

export type PublicEventOverview = {
  event: EventEntity
  participantCount: number
}

export class GetEventBySlugPublicUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly participantRepository: IParticipantRepository
  ) {}

  async execute(slug: string): Promise<PublicEventOverview> {
    const event = await this.eventRepository.findBySlug(slug)
    if (!event || event.isDeleted()) throw new EventNotFoundError(slug)
    if (event.isDraft()) throw new AppError(404, 'Event not available')
    const participantCount = await this.participantRepository.countByEventId(event.id)
    return { event, participantCount }
  }
}
