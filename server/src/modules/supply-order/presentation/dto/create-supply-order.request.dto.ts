import { AppError } from '@shared/errors/app.error'

export class CreateSupplyOrderRequestDto {
  units: number
  orderedAt: string
  estimatedDeliveryDate: string

  constructor(body: Record<string, unknown>) {
    if (typeof body.units !== 'number' || body.units <= 0) throw new AppError(400, 'units must be a positive number')
    if (typeof body.estimatedDeliveryDate !== 'string') throw new AppError(400, 'estimatedDeliveryDate is required')
    this.units = body.units
    this.orderedAt = typeof body.orderedAt === 'string' ? body.orderedAt : new Date().toISOString()
    this.estimatedDeliveryDate = body.estimatedDeliveryDate
  }
}
