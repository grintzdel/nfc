import { ParticipantEntity } from '../entity/participant.entity'

export interface IParticipantRepository {
  create(entity: ParticipantEntity): Promise<ParticipantEntity>
  findById(id: string): Promise<Nullable<ParticipantEntity>>
  findByUserAndEvent(userId: string, eventId: string): Promise<Nullable<ParticipantEntity>>
  findByBraceletId(braceletId: string): Promise<Nullable<ParticipantEntity>>
  findAllByEventId(eventId: string): Promise<ParticipantEntity[]>
  findAllByUserId(userId: string): Promise<ParticipantEntity[]>
  findPaginatedByEventId(params: {
    eventId: string
    page: number
    limit: number
    search?: string
  }): Promise<PaginatedResult<ParticipantEntity>>
  findPaginated(params: {
    page: number
    limit: number
    checkedIn?: boolean
    search?: string
  }): Promise<PaginatedResult<ParticipantEntity>>
  countInRange(from: Date, to: Date): Promise<number>
  countByEventId(eventId: string): Promise<number>
  update(entity: ParticipantEntity): Promise<ParticipantEntity>
  softDelete(id: string): Promise<void>
}
