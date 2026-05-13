import { Request, Response, NextFunction } from 'express'

import { TeamService } from '../../application/services/team.service'
import { ChangeRoleRequestDto } from '../dto/change-role.request.dto'
import { InviteTeamMemberRequestDto } from '../dto/invite-team-member.request.dto'
import { TeamMemberResponseDto } from '../dto/team-member.response.dto'

export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  async invite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new InviteTeamMemberRequestDto(req.body as Record<string, unknown>)
      const member = await this.teamService.invite({
        inviterUserId: req.user!.userId,
        eventId: req.params.eventId as string,
        targetUserId: dto.userId,
        role: dto.role,
      })
      res.status(201).json({ success: true, data: new TeamMemberResponseDto(member) })
    } catch (e) {
      next(e)
    }
  }

  async getByEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const members = await this.teamService.getByEvent(req.params.eventId as string)
      res.json({ success: true, data: members.map((m) => new TeamMemberResponseDto(m)) })
    } catch (e) {
      next(e)
    }
  }

  async accept(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const member = await this.teamService.accept(req.params.id as string, req.user!.userId)
      res.json({ success: true, data: new TeamMemberResponseDto(member) })
    } catch (e) {
      next(e)
    }
  }

  async changeRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new ChangeRoleRequestDto(req.body as Record<string, unknown>)
      const member = await this.teamService.changeRole(req.params.id as string, req.user!.userId, dto.role)
      res.json({ success: true, data: new TeamMemberResponseDto(member) })
    } catch (e) {
      next(e)
    }
  }

  async revoke(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.teamService.revoke(req.params.id as string, req.user!.userId)
      res.status(204).send()
    } catch (e) {
      next(e)
    }
  }

  async getMyMemberships(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const members = await this.teamService.getMyMemberships(req.user!.userId)
      res.json({ success: true, data: members.map((m) => new TeamMemberResponseDto(m)) })
    } catch (e) {
      next(e)
    }
  }
}
