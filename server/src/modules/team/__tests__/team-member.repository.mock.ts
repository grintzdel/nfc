import { TeamMemberEntity } from '../domain/entity/team-member.entity'
import { ITeamMemberRepository } from '../domain/repository/team-member.repository.interface'

export class TeamMemberRepositoryMock implements ITeamMemberRepository {
  create_result: TeamMemberEntity | null = null
  create_calledWith: TeamMemberEntity | null = null
  findById_result: Nullable<TeamMemberEntity> = null
  findById_calledWith: string | null = null
  findByUserAndEvent_result: Nullable<TeamMemberEntity> = null
  findByUserAndEvent_calledWith: { userId: string; eventId: string } | null = null
  findAllByEventId_result: TeamMemberEntity[] = []
  findAllByEventId_calledWith: string | null = null
  findAllByUserId_result: TeamMemberEntity[] = []
  findAllByUserId_calledWith: string | null = null
  update_result: TeamMemberEntity | null = null
  update_calledWith: TeamMemberEntity | null = null
  softDelete_calledWith: string | null = null

  async create(entity: TeamMemberEntity): Promise<TeamMemberEntity> {
    this.create_calledWith = entity
    return this.create_result ?? entity
  }

  async findById(id: string): Promise<Nullable<TeamMemberEntity>> {
    this.findById_calledWith = id
    return this.findById_result
  }

  async findByUserAndEvent(userId: string, eventId: string): Promise<Nullable<TeamMemberEntity>> {
    this.findByUserAndEvent_calledWith = { userId, eventId }
    return this.findByUserAndEvent_result
  }

  async findAllByEventId(eventId: string): Promise<TeamMemberEntity[]> {
    this.findAllByEventId_calledWith = eventId
    return this.findAllByEventId_result
  }

  async findAllByUserId(userId: string): Promise<TeamMemberEntity[]> {
    this.findAllByUserId_calledWith = userId
    return this.findAllByUserId_result
  }

  async update(entity: TeamMemberEntity): Promise<TeamMemberEntity> {
    this.update_calledWith = entity
    return this.update_result ?? entity
  }

  async softDelete(id: string): Promise<void> {
    this.softDelete_calledWith = id
  }
}
