import { BraceletStatus } from '@modules/bracelet/domain/constants/bracelet-status.constant'
import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'
import { IEventRepository } from '@modules/event/domain/repository/event.repository.interface'

import { AnalyticsDomainModel } from '../../../domain/model/analytics.domain-model'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export class GetNextEventWithStatsUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly braceletRepository: IBraceletRepository
  ) {}

  async execute(): Promise<AnalyticsDomainModel.NextEventStatsDto> {
    const event = await this.eventRepository.findNextUpcoming()
    if (!event) return { event: null }

    const braceletsOrdered = await this.braceletRepository.countByEventId(event.id)
    const braceletsPreActivated = await this.braceletRepository.countByEventIdAndStatus(
      event.id,
      BraceletStatus.PRE_ACTIVATED
    )
    const daysUntil = Math.ceil((event.startsAt.getTime() - Date.now()) / MS_PER_DAY)
    const fillRate = event.capacity === 0 ? 0 : (braceletsOrdered / event.capacity) * 100

    return {
      event: {
        id: event.id,
        name: event.name,
        city: event.city,
        staffCount: event.staffCount,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        daysUntil,
        braceletsOrdered,
        braceletsPreActivated,
        fillRate,
      },
    }
  }
}
