import { ParticipantEntity } from '@modules/participant/domain/entity/participant.entity'
import { IParticipantRepository } from '@modules/participant/domain/repository/participant.repository.interface'

import { CheckInEntity } from '../../../domain/entity/check-in.entity'
import { ICheckInRepository } from '../../../domain/repository/check-in.repository.interface'

export type CheckInWithParticipant = {
  checkIn: CheckInEntity
  participant: Nullable<ParticipantEntity>
}

export class GetPaginatedCheckInsByEventUseCase {
  constructor(
    private readonly checkInRepository: ICheckInRepository,
    private readonly participantRepository: IParticipantRepository
  ) {}

  async execute(params: {
    eventId: string
    page: number
    limit: number
  }): Promise<PaginatedResult<CheckInWithParticipant>> {
    const page = Math.max(1, params.page)
    const limit = Math.max(1, Math.min(100, params.limit))

    const [paged, participants] = await Promise.all([
      this.checkInRepository.findPaginatedByEventId({ eventId: params.eventId, page, limit }),
      this.participantRepository.findAllByEventId(params.eventId),
    ])

    const participantByBraceletId = new Map<string, ParticipantEntity>()
    for (const p of participants) {
      if (p.braceletId) participantByBraceletId.set(p.braceletId, p)
    }

    const items = paged.items.map((c) => ({
      checkIn: c,
      participant: participantByBraceletId.get(c.braceletId) ?? null,
    }))

    return { items, total: paged.total, page: paged.page, limit: paged.limit, totalPages: paged.totalPages }
  }
}
