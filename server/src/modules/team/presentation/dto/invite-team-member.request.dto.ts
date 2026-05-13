import { AppError } from '@shared/errors/app.error'

import { TeamRole } from '../../domain/constants/team-role.constant'

export class InviteTeamMemberRequestDto {
  userId: string
  role: TeamRole

  constructor(body: Record<string, unknown>) {
    if (typeof body.userId !== 'string' || !body.userId) throw new AppError(400, 'userId is required')
    if (typeof body.role !== 'string') throw new AppError(400, 'role is required')
    if (body.role !== TeamRole.MANAGER && body.role !== TeamRole.STAFF) {
      throw new AppError(400, `role must be ${TeamRole.MANAGER} or ${TeamRole.STAFF}`)
    }
    this.userId = body.userId
    this.role = body.role as TeamRole
  }
}
