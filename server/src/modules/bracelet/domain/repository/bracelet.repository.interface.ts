import { BraceletStatus } from '../constants/bracelet-status.constant'
import { BraceletEntity } from '../entity/bracelet.entity'

export interface IBraceletRepository {
  create(entity: BraceletEntity): Promise<BraceletEntity>
  findById(id: string): Promise<Nullable<BraceletEntity>>
  findByNfcId(nfcId: string): Promise<Nullable<BraceletEntity>>
  findAll(): Promise<BraceletEntity[]>
  findAllByIds(ids: string[]): Promise<BraceletEntity[]>
  findAllByStatus(status: BraceletStatus): Promise<BraceletEntity[]>
  findAllByEventId(eventId: string): Promise<BraceletEntity[]>
  findAllByEventIdAndStatus(eventId: string, status: BraceletStatus): Promise<BraceletEntity[]>
  findPaginatedByEventId(params: {
    eventId: string
    page: number
    limit: number
    search?: string
  }): Promise<PaginatedResult<BraceletEntity>>
  findPaginated(params: {
    page: number
    limit: number
    status?: BraceletStatus
    search?: string
  }): Promise<PaginatedResult<BraceletEntity>>
  findAllByUserId(userId: string): Promise<BraceletEntity[]>
  countByStatus(status: BraceletStatus): Promise<number>
  countByEventId(eventId: string): Promise<number>
  countByEventIdAndStatus(eventId: string, status: BraceletStatus): Promise<number>
  countInRange(from: Date, to: Date): Promise<number>
  countActivationsByMonthInYear(year: number): Promise<{ month: number; count: number }[]>
  update(entity: BraceletEntity): Promise<BraceletEntity>
  softDelete(id: string): Promise<void>
}
