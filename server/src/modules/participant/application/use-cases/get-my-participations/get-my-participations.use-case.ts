import { EventEntity } from '@modules/event/domain/entity/event.entity'
import { IEventRepository } from '@modules/event/domain/repository/event.repository.interface'

import { ParticipantEntity } from '../../../domain/entity/participant.entity'
import { IParticipantRepository } from '../../../domain/repository/participant.repository.interface'

export type ParticipantWithEvent = {
  participant: ParticipantEntity
  event: Nullable<EventEntity>
}

export class GetMyParticipationsUseCase {
  constructor(
    private readonly participantRepository: IParticipantRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  async execute(userId: string): Promise<ParticipantWithEvent[]> {
    const participants = await this.participantRepository.findAllByUserId(userId)
    if (participants.length === 0) return []

    const eventIds = [...new Set(participants.map((p) => p.eventId))]
    const events = await this.eventRepository.findAllByIds(eventIds)
    const eventById = new Map(events.map((e) => [e.id, e]))

    const enriched = participants.map((p) => ({
      participant: p,
      event: eventById.get(p.eventId) ?? null,
    }))

    enriched.sort((a, b) => b.participant.registeredAt.getTime() - a.participant.registeredAt.getTime())
    return enriched
  }
}
