import { EventStatus } from '../constants/event-status.constant'
import { EventEntity } from '../entity/event.entity'

export interface IEventRepository {
  create(event: EventEntity): Promise<EventEntity>
  findById(id: string): Promise<Nullable<EventEntity>>
  findBySlug(slug: string): Promise<Nullable<EventEntity>>
  findAll(): Promise<EventEntity[]>
  findAllByIds(ids: string[]): Promise<EventEntity[]>
  findAllByOwner(ownerId: string): Promise<EventEntity[]>
  findAllByStatusIn(statuses: EventStatus[]): Promise<EventEntity[]>
  findNextUpcoming(): Promise<Nullable<EventEntity>>
  countByOwner(ownerId: string): Promise<number>
  countByStatusInRange(statuses: EventStatus[], from: Date, to: Date): Promise<number>
  findPaginated(params: PaginationParams): Promise<PaginatedResult<EventEntity>>
  countByStatusNotDeleted(status: EventStatus): Promise<number>
  countCompletedInYear(year: number): Promise<number>
  countUpcomingInDays(days: number): Promise<number>
  update(event: EventEntity): Promise<EventEntity>
  softDelete(id: string): Promise<void>
}
