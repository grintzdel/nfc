import { BraceletStatus } from '@modules/bracelet/domain/constants/bracelet-status.constant'
import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'
import { ICheckInRepository } from '@modules/check-in/domain/repository/check-in.repository.interface'
import { EventNotFoundError } from '@modules/event/domain/errors/event.error'
import { IEventRepository } from '@modules/event/domain/repository/event.repository.interface'
import { IParticipantRepository } from '@modules/participant/domain/repository/participant.repository.interface'

import { AnalyticsDomainModel } from '../../../domain/model/analytics.domain-model'

export class GetEventDetailStatsUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly participantRepository: IParticipantRepository,
    private readonly braceletRepository: IBraceletRepository,
    private readonly checkInRepository: ICheckInRepository
  ) {}

  async execute(eventId: string): Promise<AnalyticsDomainModel.EventDetailStatsDto> {
    const event = await this.eventRepository.findById(eventId)
    if (!event || event.isDeleted()) throw new EventNotFoundError(eventId)

    const [participantCount, braceletsAttachedCount, braceletsActiveCount, checkInCount, allCheckIns] =
      await Promise.all([
        this.participantRepository.countByEventId(eventId),
        this.braceletRepository.countByEventId(eventId),
        this.braceletRepository.countByEventIdAndStatus(eventId, BraceletStatus.ACTIVE),
        this.checkInRepository.countByEventId(eventId),
        this.checkInRepository.findAllByEventId(eventId),
      ])

    const uniqueBraceletIds = new Set(allCheckIns.map((c) => c.braceletId))
    const uniqueParticipantsCheckedIn = uniqueBraceletIds.size

    const lastCheckIn = allCheckIns.reduce<Date | null>((acc, c) => {
      if (!acc || c.createdAt > acc) return c.createdAt
      return acc
    }, null)

    const capacity = event.capacity
    const capacityFillRate = capacity > 0 ? participantCount / capacity : 0

    return {
      participantCount,
      capacity,
      capacityFillRate,
      braceletsAttachedCount,
      braceletsActiveCount,
      checkInCount,
      uniqueParticipantsCheckedIn,
      lastCheckInAt: lastCheckIn ? lastCheckIn.toISOString() : null,
    }
  }
}
