import { Request, Response, NextFunction } from 'express'
import { EventService } from '../../application/services/event.service'
import { EventResponseDto } from '../dto/event.response.dto'
import { CreateEventRequestDto } from '../dto/create-event.request.dto'
import { UpdateEventRequestDto } from '../dto/update-event.request.dto'

export class EventController {
  constructor(private readonly eventService: EventService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new CreateEventRequestDto(req.body as Record<string, unknown>)
      const event = await this.eventService.create({
        name: dto.name,
        description: dto.description ?? '',
        venueName: dto.venueName ?? '',
        venueAddress: dto.venueAddress ?? '',
        city: dto.city ?? '',
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        capacity: dto.capacity,
        staffCount: dto.staffCount ?? 0,
        ownerId: req.user!.userId,
      })
      res.status(201).json({ success: true, data: new EventResponseDto(event) })
    } catch (e) { next(e) }
  }

  async getMyEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const events = await this.eventService.getMyEvents(req.user!.userId)
      res.json({ success: true, data: events.map((e) => new EventResponseDto(e)) })
    } catch (e) { next(e) }
  }

  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const events = await this.eventService.getAll()
      res.json({ success: true, data: events.map((e) => new EventResponseDto(e)) })
    } catch (e) { next(e) }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await this.eventService.getById(req.params.id as string)
      res.json({ success: true, data: new EventResponseDto(event) })
    } catch (e) { next(e) }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new UpdateEventRequestDto(req.body as Record<string, unknown>)
      const event = await this.eventService.update(req.params.id as string, req.user!.userId, {
        ...dto,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      })
      res.json({ success: true, data: new EventResponseDto(event) })
    } catch (e) { next(e) }
  }

  async publish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await this.eventService.publish(req.params.id as string, req.user!.userId)
      res.json({ success: true, data: new EventResponseDto(event) })
    } catch (e) { next(e) }
  }

  async start(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await this.eventService.start(req.params.id as string, req.user!.userId)
      res.json({ success: true, data: new EventResponseDto(event) })
    } catch (e) { next(e) }
  }

  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await this.eventService.complete(req.params.id as string, req.user!.userId)
      res.json({ success: true, data: new EventResponseDto(event) })
    } catch (e) { next(e) }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await this.eventService.cancel(req.params.id as string, req.user!.userId)
      res.json({ success: true, data: new EventResponseDto(event) })
    } catch (e) { next(e) }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.eventService.delete(req.params.id as string, req.user!.userId)
      res.status(204).send()
    } catch (e) { next(e) }
  }

  async getPublicBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { event, participantCount } = await this.eventService.getPublicBySlug(req.params.slug as string)
      res.json({ success: true, data: { ...new EventResponseDto(event), participantCount } })
    } catch (e) { next(e) }
  }

  async listPaginated(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, Number(req.query.page) || 1)
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 8))
      const search = typeof req.query.search === 'string' ? req.query.search : undefined
      const status = typeof req.query.status === 'string' ? req.query.status : undefined
      const data = await this.eventService.listPaginated({ page, limit, search, status })
      res.json({ success: true, data })
    } catch (e) { next(e) }
  }
}
