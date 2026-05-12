import { TeamMemberEntity } from '../entity/team-member.entity'

export interface ITeamMemberRepository {
  create(entity: TeamMemberEntity): Promise<TeamMemberEntity>
  findById(id: string): Promise<Nullable<TeamMemberEntity>>
  findByUserAndEvent(userId: string, eventId: string): Promise<Nullable<TeamMemberEntity>>
  findAllByEventId(eventId: string): Promise<TeamMemberEntity[]>
  findAllByUserId(userId: string): Promise<TeamMemberEntity[]>
  update(entity: TeamMemberEntity): Promise<TeamMemberEntity>
  softDelete(id: string): Promise<void>
}
