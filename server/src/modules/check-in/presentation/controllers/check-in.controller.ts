import { Request, Response, NextFunction } from 'express'
import { CheckInService } from '../../application/services/check-in.service'
import { RecordCheckInRequestDto } from '../dto/record-check-in.request.dto'
import { CheckInResponseDto } from '../dto/check-in.response.dto'

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
}
