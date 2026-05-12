import { TeamMemberEntity } from '../../../domain/entity/team-member.entity'
import { ITeamMemberRepository } from '../../../domain/repository/team-member.repository.interface'

export class GetMyMembershipsUseCase {
  constructor(private readonly teamMemberRepository: ITeamMemberRepository) {}

  async execute(userId: string): Promise<TeamMemberEntity[]> {
    return this.teamMemberRepository.findAllByUserId(userId)
  }
}
