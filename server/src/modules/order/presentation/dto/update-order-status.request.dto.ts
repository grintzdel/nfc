import { AppError } from '@shared/errors/app.error'

import { OrderStatus } from '../../domain/constants/order.constant'

const validStatuses = Object.values(OrderStatus)

export class UpdateOrderStatusRequestDto {
  public readonly status: OrderStatus
  constructor(body: Record<string, unknown>) {
    if (!body.status || !validStatuses.includes(body.status as OrderStatus))
      throw new AppError(400, `Status must be one of: ${validStatuses.join(', ')}`)
    this.status = body.status as OrderStatus
  }
}
