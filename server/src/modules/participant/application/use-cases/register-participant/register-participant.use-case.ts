import { EventFullError, EventNotFoundError } from '@modules/event/domain/errors/event.error'
import { IEventRepository } from '@modules/event/domain/repository/event.repository.interface'
import { AppError } from '@shared/errors/app.error'

import { ParticipantEntity, ParticipantProfile } from '../../../domain/entity/participant.entity'
import { ParticipantAlreadyRegisteredError } from '../../../domain/errors/participant.error'
import { IParticipantRepository } from '../../../domain/repository/participant.repository.interface'

export interface RegisterParticipantInput {
  userId: string
  eventId: string
  profile: ParticipantProfile
}

export class RegisterParticipantUseCase {
  constructor(
    private readonly participantRepository: IParticipantRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  async execute(input: RegisterParticipantInput): Promise<ParticipantEntity> {
    const event = await this.eventRepository.findById(input.eventId)
    if (!event || event.isDeleted()) throw new EventNotFoundError(input.eventId)

    if (event.isCompleted() || event.isCancelled()) {
      throw new AppError(400, 'Cannot register for a completed or cancelled event')
    }

    const existing = await this.participantRepository.findByUserAndEvent(input.userId, input.eventId)
    if (existing) throw new ParticipantAlreadyRegisteredError(input.userId, input.eventId)

    if (event.capacity > 0) {
      const currentCount = await this.participantRepository.countByEventId(input.eventId)
      if (currentCount >= event.capacity) throw new EventFullError(input.eventId)
    }

    const entity = ParticipantEntity.create({
      userId: input.userId,
      eventId: input.eventId,
      profile: input.profile,
    })

    return this.participantRepository.create(entity)
  }
}
