import { JwtServiceSecurity } from '@modules/auth/application/services/security/jwt.service-security'
import { IUserRepository } from '@modules/auth/domain/repository/user.repository.interface'
import { IEventRepository } from '@modules/event/domain/repository/event.repository.interface'
import { createAuthMiddleware, createAdminMiddleware } from '@shared/middlewares/auth.middleware'
import { Router } from 'express'

import { TeamService } from './application/services/team.service'
import { AcceptInvitationUseCase } from './application/use-cases/accept-invitation/accept-invitation.use-case'
import { ChangeRoleUseCase } from './application/use-cases/change-role/change-role.use-case'
import { GetMyMembershipsUseCase } from './application/use-cases/get-my-memberships/get-my-memberships.use-case'
import { GetTeamMembersByEventUseCase } from './application/use-cases/get-team-members-by-event/get-team-members-by-event.use-case'
import { InviteTeamMemberUseCase } from './application/use-cases/invite-team-member/invite-team-member.use-case'
import { RevokeTeamMemberUseCase } from './application/use-cases/revoke-team-member/revoke-team-member.use-case'
import { ITeamMemberRepository } from './domain/repository/team-member.repository.interface'
import { TeamMemberRepositoryMongooseMongo } from './infrastructure/repository/team-member.repository.mongoose-mongo'
import { TeamController } from './presentation/controllers/team.controller'

export function createTeamModule(
  jwtService: JwtServiceSecurity,
  userRepository: IUserRepository,
  eventRepository: IEventRepository
): { router: Router; teamMemberRepository: ITeamMemberRepository } {
  const teamMemberRepository = new TeamMemberRepositoryMongooseMongo()

  const inviteUC = new InviteTeamMemberUseCase(teamMemberRepository, eventRepository, userRepository)
  const acceptUC = new AcceptInvitationUseCase(teamMemberRepository)
  const changeRoleUC = new ChangeRoleUseCase(teamMemberRepository, eventRepository)
  const revokeUC = new RevokeTeamMemberUseCase(teamMemberRepository, eventRepository)
  const getByEventUC = new GetTeamMembersByEventUseCase(teamMemberRepository)
  const getMyMembershipsUC = new GetMyMembershipsUseCase(teamMemberRepository)

  const service = new TeamService(inviteUC, acceptUC, changeRoleUC, revokeUC, getByEventUC, getMyMembershipsUC)
  const controller = new TeamController(service)

  const auth = createAuthMiddleware(jwtService)
  const admin = createAdminMiddleware()

  const router = Router()
  router.post('/events/:eventId/invite', auth, (req, res, next) => controller.invite(req, res, next))
  router.get('/events/:eventId', auth, admin, (req, res, next) => controller.getByEvent(req, res, next))
  router.get('/me', auth, (req, res, next) => controller.getMyMemberships(req, res, next))
  router.post('/:id/accept', auth, (req, res, next) => controller.accept(req, res, next))
  router.patch('/:id/role', auth, (req, res, next) => controller.changeRole(req, res, next))
  router.delete('/:id', auth, (req, res, next) => controller.revoke(req, res, next))

  return { router, teamMemberRepository }
}
