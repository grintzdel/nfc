import { TeamMemberEntity } from '../../../domain/entity/team-member.entity'
import { ITeamMemberRepository } from '../../../domain/repository/team-member.repository.interface'

export class GetTeamMembersByEventUseCase {
  constructor(private readonly teamMemberRepository: ITeamMemberRepository) {}

  async execute(eventId: string): Promise<TeamMemberEntity[]> {
    return this.teamMemberRepository.findAllByEventId(eventId)
  }
}
