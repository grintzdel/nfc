import type { TeamDomainModel } from '../model/team.domain-model'

export interface ITeamPort {
  invite(eventId: string, dto: TeamDomainModel.InviteTeamMemberDto): Promise<TeamDomainModel.TeamMemberOverviewDto>
  getByEvent(eventId: string): Promise<TeamDomainModel.TeamMemberOverviewDto[]>
  getMyMemberships(): Promise<TeamDomainModel.TeamMemberOverviewDto[]>
  accept(id: string): Promise<TeamDomainModel.TeamMemberOverviewDto>
  changeRole(id: string, dto: TeamDomainModel.ChangeRoleDto): Promise<TeamDomainModel.TeamMemberOverviewDto>
  revoke(id: string): Promise<void>
}
