import { CheckInEntity } from '../entity/check-in.entity'
import { InteractionType } from '../constants/interaction-type.constant'

export interface ICheckInRepository {
  create(entity: CheckInEntity): Promise<CheckInEntity>
  findById(id: string): Promise<Nullable<CheckInEntity>>
  findAllByEventId(eventId: string): Promise<CheckInEntity[]>
  findAllByBraceletId(braceletId: string): Promise<CheckInEntity[]>
  findPaginatedByEventId(params: { eventId: string; page: number; limit: number }): Promise<PaginatedResult<CheckInEntity>>
  countByInteractionType(): Promise<{ type: InteractionType; count: number }[]>
  countByEventIdAndType(eventId: string, type: InteractionType): Promise<number>
  countByEventId(eventId: string): Promise<number>
}
