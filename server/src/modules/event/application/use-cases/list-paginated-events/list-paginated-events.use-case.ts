import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'
import { ICheckInRepository } from '@modules/check-in/domain/repository/check-in.repository.interface'

import { IEventRepository } from '../../../domain/repository/event.repository.interface'

export interface PaginatedEventRow {
  id: string
  name: string
  venueName: string
  city: string
  startsAt: Date
  endsAt: Date
  capacity: number
  staffCount: number
  status: string
  braceletsCount: number
  checkInsCount: number
  checkInsRate: number
}

export class ListPaginatedEventsUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly braceletRepository: IBraceletRepository,
    private readonly checkInRepository: ICheckInRepository
  ) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<PaginatedEventRow>> {
    const result = await this.eventRepository.findPaginated(params)
    const rows: PaginatedEventRow[] = await Promise.all(
      result.items.map(async (event) => {
        const braceletsCount = await this.braceletRepository.countByEventId(event.id)
        const checkInsCount = await this.checkInRepository.countByEventId(event.id)
        return {
          id: event.id,
          name: event.name,
          venueName: event.venueName,
          city: event.city,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          capacity: event.capacity,
          staffCount: event.staffCount,
          status: event.status,
          braceletsCount,
          checkInsCount,
          checkInsRate: braceletsCount > 0 ? Math.round((checkInsCount / braceletsCount) * 100) : 0,
        }
      })
    )
    return { items: rows, total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages }
  }
}
