import { Request, Response, NextFunction } from 'express'

import { ParticipantService } from '../../application/services/participant.service'
import { AttachBraceletRequestDto } from '../dto/attach-bracelet.request.dto'
import { MyParticipationResponseDto } from '../dto/my-participations.response.dto'
import { PaginatedParticipantsResponseDto } from '../dto/paginated-participants.response.dto'
import { ParticipantResponseDto } from '../dto/participant.response.dto'
import { RegisterParticipantRequestDto } from '../dto/register-participant.request.dto'
import { UpdateParticipantProfileRequestDto } from '../dto/update-participant-profile.request.dto'

export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new RegisterParticipantRequestDto(req.body as Record<string, unknown>)
      const participant = await this.participantService.register({
        userId: req.user!.userId,
        eventId: dto.eventId,
        profile: dto.profile,
      })
      res.status(201).json({ success: true, data: new ParticipantResponseDto(participant) })
    } catch (e) {
      next(e)
    }
  }

  async getMyParticipations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await this.participantService.getMyParticipations(req.user!.userId)
      res.json({ success: true, data: items.map((it) => new MyParticipationResponseDto(it.participant, it.event)) })
    } catch (e) {
      next(e)
    }
  }

  async getByEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const participants = await this.participantService.getByEvent(req.params.eventId as string)
      res.json({ success: true, data: participants.map((p) => new ParticipantResponseDto(p)) })
    } catch (e) {
      next(e)
    }
  }

  async getPaginatedByEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = req.params.eventId as string
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 20
      const search = typeof req.query.search === 'string' ? req.query.search : undefined
      const paged = await this.participantService.getPaginatedByEvent({ eventId, page, limit, search })
      res.json({ success: true, data: new PaginatedParticipantsResponseDto(paged) })
    } catch (e) {
      next(e)
    }
  }

  async getPaginated(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 20
      const search = typeof req.query.search === 'string' ? req.query.search : undefined
      const checkedInRaw = req.query.checkedIn
      const checkedIn = checkedInRaw === 'true' ? true : checkedInRaw === 'false' ? false : undefined
      const paged = await this.participantService.getPaginated({ page, limit, checkedIn, search })
      res.json({
        success: true,
        data: {
          items: paged.items.map((it) => new MyParticipationResponseDto(it.participant, it.event)),
          total: paged.total,
          page: paged.page,
          limit: paged.limit,
          totalPages: paged.totalPages,
        },
      })
    } catch (e) {
      next(e)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const participant = await this.participantService.getById(req.params.id as string)
      res.json({ success: true, data: new ParticipantResponseDto(participant) })
    } catch (e) {
      next(e)
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new UpdateParticipantProfileRequestDto(req.body as Record<string, unknown>)
      const participant = await this.participantService.updateProfile(
        req.params.id as string,
        req.user!.userId,
        dto.toPartialProfile()
      )
      res.json({ success: true, data: new ParticipantResponseDto(participant) })
    } catch (e) {
      next(e)
    }
  }

  async attachBracelet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new AttachBraceletRequestDto(req.body as Record<string, unknown>)
      const participant = await this.participantService.attachBracelet(req.params.id as string, dto.braceletId)
      res.json({ success: true, data: new ParticipantResponseDto(participant) })
    } catch (e) {
      next(e)
    }
  }

  async unregister(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.participantService.unregister(req.params.id as string, req.user!.userId)
      res.status(204).send()
    } catch (e) {
      next(e)
    }
  }
}
