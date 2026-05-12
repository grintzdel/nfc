import { IEventRepository } from '../domain/repository/event.repository.interface'
import { EventEntity } from '../domain/entity/event.entity'
import { EventStatus } from '../domain/constants/event-status.constant'

export class EventRepositoryMock implements IEventRepository {
  create_result:  Nullable<EventEntity> = null
  create_calledWith: Nullable<EventEntity> = null
  findById_result: Nullable<EventEntity> = null
  findById_calledWith: Nullable<string> = null
  findBySlug_result: Nullable<EventEntity> = null
  findBySlug_calledWith: Nullable<string> = null
  findAll_result: EventEntity[] = []
  findAllByIds_result: EventEntity[] = []
  findAllByIds_calledWith: string[] | null = null
  findAllByOwner_result: EventEntity[] = []
  findAllByStatusIn_result: EventEntity[] = []
  findNextUpcoming_result: Nullable<EventEntity> = null
  countByOwner_result = 0
  countByStatusInRange_result = 0
  findPaginated_result: PaginatedResult<EventEntity> = { items: [], total: 0, page: 1, limit: 8, totalPages: 0 }
  countByStatusNotDeleted_result = 0
  countCompletedInYear_result = 0
  countUpcomingInDays_result = 0
  update_result: EventEntity | null = null
  update_calledWith: EventEntity | null = null
  softDelete_calledWith: string | null = null

  async create(e: EventEntity): Promise<EventEntity> { this.create_calledWith = e; return this.create_result ?? e }
  async findById(id: string): Promise<Nullable<EventEntity>> { this.findById_calledWith = id; return this.findById_result }
  async findBySlug(slug: string): Promise<Nullable<EventEntity>> { this.findBySlug_calledWith = slug; return this.findBySlug_result }
  async findAll(): Promise<EventEntity[]> { return this.findAll_result }
  async findAllByIds(ids: string[]): Promise<EventEntity[]> {
    this.findAllByIds_calledWith = ids
    return this.findAllByIds_result
  }
  async findAllByOwner(_ownerId: string): Promise<EventEntity[]> { return this.findAllByOwner_result }
  async findAllByStatusIn(_statuses: EventStatus[]): Promise<EventEntity[]> { return this.findAllByStatusIn_result }
  async findNextUpcoming(): Promise<Nullable<EventEntity>> { return this.findNextUpcoming_result }
  async countByOwner(_ownerId: string): Promise<number> { return this.countByOwner_result }
  async countByStatusInRange(_s: EventStatus[], _f: Date, _t: Date): Promise<number> { return this.countByStatusInRange_result }
  async findPaginated(_params: PaginationParams): Promise<PaginatedResult<EventEntity>> { return this.findPaginated_result }
  async countByStatusNotDeleted(_status: EventStatus): Promise<number> { return this.countByStatusNotDeleted_result }
  async countCompletedInYear(_year: number): Promise<number> { return this.countCompletedInYear_result }
  async countUpcomingInDays(_days: number): Promise<number> { return this.countUpcomingInDays_result }
  async update(e: EventEntity): Promise<EventEntity> { this.update_calledWith = e; return this.update_result ?? e }
  async softDelete(id: string): Promise<void> { this.softDelete_calledWith = id }
}
