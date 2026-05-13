import { EventEntity } from '@modules/event/domain/entity/event.entity'
import { IEventRepository } from '@modules/event/domain/repository/event.repository.interface'

import { ParticipantEntity } from '../../../domain/entity/participant.entity'
import { IParticipantRepository } from '../../../domain/repository/participant.repository.interface'

export type ParticipantWithEventItem = {
  participant: ParticipantEntity
  event: Nullable<EventEntity>
}

export class GetPaginatedParticipantsUseCase {
  constructor(
    private readonly participantRepository: IParticipantRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  async execute(params: {
    page: number
    limit: number
    checkedIn?: boolean
    search?: string
  }): Promise<PaginatedResult<ParticipantWithEventItem>> {
    const page = Math.max(1, params.page)
    const limit = Math.max(1, Math.min(100, params.limit))

    const paged = await this.participantRepository.findPaginated({
      page,
      limit,
      checkedIn: params.checkedIn,
      search: params.search,
    })

    if (paged.items.length === 0) return { ...paged, items: [] }

    const eventIds = [...new Set(paged.items.map((p) => p.eventId))]
    const events = await this.eventRepository.findAllByIds(eventIds)
    const eventById = new Map(events.map((e) => [e.id, e]))

    const items = paged.items.map((p) => ({
      participant: p,
      event: eventById.get(p.eventId) ?? null,
    }))

    return { ...paged, items }
  }
}
