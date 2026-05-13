import { EventStatus } from '@modules/event/domain/constants/event-status.constant'
import { IEventRepository } from '@modules/event/domain/repository/event.repository.interface'
import { getMonthRange } from '@shared/utils/month-range'

import { AnalyticsDomainModel } from '../../../domain/model/analytics.domain-model'

export class ListActiveEventsWithStatsUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(): Promise<AnalyticsDomainModel.ActiveEventsStatsDto> {
    const activeStatuses: EventStatus[] = [EventStatus.UPCOMING, EventStatus.IN_PROGRESS]
    const events = await this.eventRepository.findAllByStatusIn(activeStatuses)
    const thisMonth = getMonthRange(0)
    const lastMonth = getMonthRange(-1)
    const currentCount = await this.eventRepository.countByStatusInRange(activeStatuses, thisMonth.from, thisMonth.to)
    const previousCount = await this.eventRepository.countByStatusInRange(activeStatuses, lastMonth.from, lastMonth.to)
    return {
      events: events.map((e) => e.toJSON()),
      count: currentCount,
      diffVsLastMonth: currentCount - previousCount,
    }
  }
}
