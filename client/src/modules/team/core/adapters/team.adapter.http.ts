import type { HttpClient } from '@/modules/shared/http/http-client'

import type { TeamDomainModel } from '../model/team.domain-model'
import type { ITeamPort } from '../ports/team.port'

export class TeamHttpAdapter implements ITeamPort {
  constructor(private readonly httpClient: HttpClient) {}

  async invite(
    eventId: string,
    dto: TeamDomainModel.InviteTeamMemberDto
  ): Promise<TeamDomainModel.TeamMemberOverviewDto> {
    const result = await this.httpClient.post<TeamDomainModel.TeamMemberOverviewDto>(
      `/teams/events/${eventId}/invite`,
      dto
    )
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getByEvent(eventId: string): Promise<TeamDomainModel.TeamMemberOverviewDto[]> {
    const result = await this.httpClient.get<TeamDomainModel.TeamMemberOverviewDto[]>(`/teams/events/${eventId}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getMyMemberships(): Promise<TeamDomainModel.TeamMemberOverviewDto[]> {
    const result = await this.httpClient.get<TeamDomainModel.TeamMemberOverviewDto[]>('/teams/me')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async accept(id: string): Promise<TeamDomainModel.TeamMemberOverviewDto> {
    const result = await this.httpClient.post<TeamDomainModel.TeamMemberOverviewDto>(`/teams/${id}/accept`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async changeRole(id: string, dto: TeamDomainModel.ChangeRoleDto): Promise<TeamDomainModel.TeamMemberOverviewDto> {
    const result = await this.httpClient.patch<TeamDomainModel.TeamMemberOverviewDto>(`/teams/${id}/role`, dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async revoke(id: string): Promise<void> {
    const result = await this.httpClient.delete(`/teams/${id}`)
    if (result.error) throw new Error(result.error.message)
  }
}
