import { IParticipantRepository } from '../domain/repository/participant.repository.interface'
import { ParticipantEntity } from '../domain/entity/participant.entity'

export class ParticipantRepositoryMock implements IParticipantRepository {
  create_result: ParticipantEntity | null = null
  create_calledWith: ParticipantEntity | null = null
  findById_result: Nullable<ParticipantEntity> = null
  findById_calledWith: string | null = null
  findByUserAndEvent_result: Nullable<ParticipantEntity> = null
  findByUserAndEvent_calledWith: { userId: string; eventId: string } | null = null
  findByBraceletId_result: Nullable<ParticipantEntity> = null
  findByBraceletId_calledWith: string | null = null
  findAllByEventId_result: ParticipantEntity[] = []
  findAllByEventId_calledWith: string | null = null
  findAllByUserId_result: ParticipantEntity[] = []
  findAllByUserId_calledWith: string | null = null
  countInRange_result = 0
  countByEventId_result = 0
  update_result: ParticipantEntity | null = null
  update_calledWith: ParticipantEntity | null = null
  softDelete_calledWith: string | null = null

  async create(entity: ParticipantEntity): Promise<ParticipantEntity> {
    this.create_calledWith = entity
    return this.create_result ?? entity
  }

  async findById(id: string): Promise<Nullable<ParticipantEntity>> {
    this.findById_calledWith = id
    return this.findById_result
  }

  async findByUserAndEvent(userId: string, eventId: string): Promise<Nullable<ParticipantEntity>> {
    this.findByUserAndEvent_calledWith = { userId, eventId }
    return this.findByUserAndEvent_result
  }

  async findByBraceletId(braceletId: string): Promise<Nullable<ParticipantEntity>> {
    this.findByBraceletId_calledWith = braceletId
    return this.findByBraceletId_result
  }

  async findAllByEventId(eventId: string): Promise<ParticipantEntity[]> {
    this.findAllByEventId_calledWith = eventId
    return this.findAllByEventId_result
  }

  async findAllByUserId(userId: string): Promise<ParticipantEntity[]> {
    this.findAllByUserId_calledWith = userId
    return this.findAllByUserId_result
  }

  async countInRange(_from: Date, _to: Date): Promise<number> { return this.countInRange_result }

  async countByEventId(_eventId: string): Promise<number> { return this.countByEventId_result }

  async update(entity: ParticipantEntity): Promise<ParticipantEntity> {
    this.update_calledWith = entity
    return this.update_result ?? entity
  }

  async softDelete(id: string): Promise<void> { this.softDelete_calledWith = id }
}
