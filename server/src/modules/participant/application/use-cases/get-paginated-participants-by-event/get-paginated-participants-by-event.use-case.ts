import { BraceletEntity } from '@modules/bracelet/domain/entity/bracelet.entity'
import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'

import { ParticipantEntity } from '../../../domain/entity/participant.entity'
import { IParticipantRepository } from '../../../domain/repository/participant.repository.interface'

export type ParticipantWithBracelet = {
  participant: ParticipantEntity
  bracelet: Nullable<BraceletEntity>
}

export class GetPaginatedParticipantsByEventUseCase {
  constructor(
    private readonly participantRepository: IParticipantRepository,
    private readonly braceletRepository: IBraceletRepository
  ) {}

  async execute(params: {
    eventId: string
    page: number
    limit: number
    search?: string
  }): Promise<PaginatedResult<ParticipantWithBracelet>> {
    const page = Math.max(1, params.page)
    const limit = Math.max(1, Math.min(100, params.limit))

    const paged = await this.participantRepository.findPaginatedByEventId({
      eventId: params.eventId,
      page,
      limit,
      search: params.search,
    })

    const braceletIds = paged.items.map((p) => p.braceletId).filter((id): id is string => id !== null)

    const bracelets = braceletIds.length > 0 ? await this.braceletRepository.findAllByIds(braceletIds) : []
    const map = new Map(bracelets.map((b) => [b.id, b]))

    const items = paged.items.map((p) => ({
      participant: p,
      bracelet: p.braceletId ? (map.get(p.braceletId) ?? null) : null,
    }))

    return { items, total: paged.total, page: paged.page, limit: paged.limit, totalPages: paged.totalPages }
  }
}
