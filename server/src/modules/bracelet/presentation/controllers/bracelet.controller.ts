import { AppError } from '@shared/errors/app.error'
import { Request, Response, NextFunction } from 'express'

import { BraceletService } from '../../application/services/bracelet.service'
import { GetAvailableBraceletsUseCase } from '../../application/use-cases/get-available-bracelets/get-available-bracelets.use-case'
import { GetPaginatedBraceletsByEventUseCase } from '../../application/use-cases/get-paginated-bracelets-by-event/get-paginated-bracelets-by-event.use-case'
import { BraceletStatus } from '../../domain/constants/bracelet-status.constant'
import { AssignBraceletRequestDto } from '../dto/assign-bracelet.request.dto'
import { BraceletResponseDto } from '../dto/bracelet.response.dto'
import { CreateBraceletRequestDto } from '../dto/create-bracelet.request.dto'
import { PaginatedBraceletsResponseDto } from '../dto/paginated-bracelets.response.dto'

export class BraceletController {
  constructor(private readonly braceletService: BraceletService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new CreateBraceletRequestDto(req.body as Record<string, unknown>)
      const bracelet = await this.braceletService.create({ nfcId: dto.nfcId, productId: dto.productId })
      res.status(201).json({ success: true, data: new BraceletResponseDto(bracelet) })
    } catch (e) {
      next(e)
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as BraceletStatus | undefined
      const bracelets = await this.braceletService.getAll(status)
      res.json({ success: true, data: bracelets.map((b) => new BraceletResponseDto(b)) })
    } catch (e) {
      next(e)
    }
  }

  async getPaginated(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 20
      const status =
        typeof req.query.status === 'string' && req.query.status ? (req.query.status as BraceletStatus) : undefined
      const search = typeof req.query.search === 'string' ? req.query.search : undefined
      const paged = await this.braceletService.getPaginated({ page, limit, status, search })
      res.json({
        success: true,
        data: {
          items: paged.items.map((b) => new BraceletResponseDto(b)),
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
      const bracelet = await this.braceletService.getById(req.params.id as string)
      res.json({ success: true, data: new BraceletResponseDto(bracelet) })
    } catch (e) {
      next(e)
    }
  }

  async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new AssignBraceletRequestDto(req.body as Record<string, unknown>)
      const bracelet = await this.braceletService.assign(req.params.id as string, dto.userId, dto.eventId)
      res.json({ success: true, data: new BraceletResponseDto(bracelet) })
    } catch (e) {
      next(e)
    }
  }

  async disable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bracelet = await this.braceletService.disable(req.params.id as string)
      res.json({ success: true, data: new BraceletResponseDto(bracelet) })
    } catch (e) {
      next(e)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.braceletService.delete(req.params.id as string)
      res.status(204).send()
    } catch (e) {
      next(e)
    }
  }

  async getAvailable(
    useCase: GetAvailableBraceletsUseCase,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const eventId = typeof req.query.eventId === 'string' ? req.query.eventId : null
      if (!eventId) throw new AppError(400, 'eventId query param is required')
      const bracelets = await useCase.execute({ eventId })
      res.json({ success: true, data: bracelets.map((b) => new BraceletResponseDto(b)) })
    } catch (e) {
      next(e)
    }
  }

  async getPaginatedByEvent(
    useCase: GetPaginatedBraceletsByEventUseCase,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const eventId = req.params.eventId as string
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 20
      const search = typeof req.query.search === 'string' ? req.query.search : undefined
      const paged = await useCase.execute({ eventId, page, limit, search })
      res.json({ success: true, data: new PaginatedBraceletsResponseDto(paged) })
    } catch (e) {
      next(e)
    }
  }
}
