import { Request, Response, NextFunction } from 'express'
import { SupplyOrderService } from '../../application/services/supply-order.service'
import { SupplyOrderResponseDto } from '../dto/supply-order.response.dto'
import { CreateSupplyOrderRequestDto } from '../dto/create-supply-order.request.dto'

export class SupplyOrderController {
  constructor(private readonly supplyOrderService: SupplyOrderService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new CreateSupplyOrderRequestDto(req.body as Record<string, unknown>)
      const entity = await this.supplyOrderService.create({
        units: dto.units,
        orderedAt: new Date(dto.orderedAt),
        estimatedDeliveryDate: new Date(dto.estimatedDeliveryDate),
      })
      res.status(201).json({ success: true, data: new SupplyOrderResponseDto(entity) })
    } catch (e) { next(e) }
  }

  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entities = await this.supplyOrderService.getAll()
      res.json({ success: true, data: entities.map((e) => new SupplyOrderResponseDto(e)) })
    } catch (e) { next(e) }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entity = await this.supplyOrderService.getById(req.params.id as string)
      res.json({ success: true, data: new SupplyOrderResponseDto(entity) })
    } catch (e) { next(e) }
  }

  async markReceived(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entity = await this.supplyOrderService.markReceived(req.params.id as string)
      res.json({ success: true, data: new SupplyOrderResponseDto(entity) })
    } catch (e) { next(e) }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entity = await this.supplyOrderService.cancel(req.params.id as string)
      res.json({ success: true, data: new SupplyOrderResponseDto(entity) })
    } catch (e) { next(e) }
  }
}
