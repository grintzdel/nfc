import { AppError } from '@shared/errors/app.error'

export class UpdateOrderRequestDto {
  public readonly shippingAddress?: string

  constructor(body: Record<string, unknown>) {
    if (body.shippingAddress !== undefined) {
      if (typeof body.shippingAddress !== 'string') throw new AppError(400, 'shippingAddress must be a string')
      this.shippingAddress = body.shippingAddress
    }
  }
}
