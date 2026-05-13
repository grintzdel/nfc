import { EventStatus } from '@modules/event/domain/constants/event-status.constant'
import { IEventRepository } from '@modules/event/domain/repository/event.repository.interface'

import { AnalyticsDomainModel } from '../../../domain/model/analytics.domain-model'

export class GetEventPageStatsUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(): Promise<AnalyticsDomainModel.EventPageStatsDto> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1)

    const allStatuses = [
      EventStatus.DRAFT,
      EventStatus.UPCOMING,
      EventStatus.IN_PROGRESS,
      EventStatus.COMPLETED,
      EventStatus.CANCELLED,
    ]

    const allEvents = await this.eventRepository.findAll()
    const totalEvents = allEvents.length

    const [thisMonthCount, lastMonthCount, upcomingIn30Days, inProgressCount, completedThisYear, cancelledThisYear] =
      await Promise.all([
        this.eventRepository.countByStatusInRange(allStatuses, startOfMonth, now),
        this.eventRepository.countByStatusInRange(allStatuses, startOfLastMonth, startOfMonth),
        this.eventRepository.countUpcomingInDays(30),
        this.eventRepository.countByStatusNotDeleted(EventStatus.IN_PROGRESS),
        this.eventRepository.countCompletedInYear(now.getFullYear()),
        this.eventRepository.countByStatusInRange([EventStatus.CANCELLED], startOfYear, startOfNextYear),
      ])

    const finishedTotal = completedThisYear + cancelledThisYear
    const successRate = finishedTotal > 0 ? Math.round((completedThisYear / finishedTotal) * 100) : 100

    return {
      totalEvents,
      diffVsLastMonth: thisMonthCount - lastMonthCount,
      upcomingIn30Days,
      inProgressCount,
      completedThisYear,
      successRate,
    }
  }
}
