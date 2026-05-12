import { Request, Response, NextFunction } from 'express'
import { CheckInService } from '../../application/services/check-in.service'
import { RecordCheckInRequestDto } from '../dto/record-check-in.request.dto'
import { CheckInResponseDto } from '../dto/check-in.response.dto'
import { PaginatedCheckInsResponseDto } from '../dto/paginated-check-ins.response.dto'

export class CheckInController {
  constructor(private readonly service: CheckInService) {}

  async record(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new RecordCheckInRequestDto(req.body as Record<string, unknown>)
      const saved = await this.service.recordCheckIn(dto)
      res.status(201).json(new CheckInResponseDto(saved))
    } catch (err) {
      next(err)
    }
  }

  async getByEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entities = await this.service.getByEventId(req.params.eventId as string)
      res.status(200).json(entities.map((e) => new CheckInResponseDto(e)))
    } catch (err) {
      next(err)
    }
  }

  async getPaginatedByEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = req.params.eventId as string
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 20
      const paged = await this.service.getPaginatedByEventId({ eventId, page, limit })
      res.json({ success: true, data: new PaginatedCheckInsResponseDto(paged) })
    } catch (err) {
      next(err)
    }
  }
}
