import { ParticipantEntity } from '@modules/participant/domain/entity/participant.entity'
import { IParticipantRepository } from '@modules/participant/domain/repository/participant.repository.interface'

import { BraceletEntity } from '../../../domain/entity/bracelet.entity'
import { IBraceletRepository } from '../../../domain/repository/bracelet.repository.interface'

export type BraceletWithParticipant = {
  bracelet: BraceletEntity
  participant: Nullable<ParticipantEntity>
}

export class GetPaginatedBraceletsByEventUseCase {
  constructor(
    private readonly braceletRepository: IBraceletRepository,
    private readonly participantRepository: IParticipantRepository
  ) {}

  async execute(params: {
    eventId: string
    page: number
    limit: number
    search?: string
  }): Promise<PaginatedResult<BraceletWithParticipant>> {
    const page = Math.max(1, params.page)
    const limit = Math.max(1, Math.min(100, params.limit))

    const [paged, participants] = await Promise.all([
      this.braceletRepository.findPaginatedByEventId({
        eventId: params.eventId,
        page,
        limit,
        search: params.search,
      }),
      this.participantRepository.findAllByEventId(params.eventId),
    ])

    const participantByBraceletId = new Map<string, ParticipantEntity>()
    for (const p of participants) {
      if (p.braceletId) participantByBraceletId.set(p.braceletId, p)
    }

    const items = paged.items.map((b) => ({
      bracelet: b,
      participant: participantByBraceletId.get(b.id) ?? null,
    }))

    return { items, total: paged.total, page: paged.page, limit: paged.limit, totalPages: paged.totalPages }
  }
}
