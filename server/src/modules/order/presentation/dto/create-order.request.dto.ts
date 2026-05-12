import { AppError } from '@shared/errors/app.error'

export class CreateOrderRequestDto {
  public readonly shippingAddress: string
  constructor(body: Record<string, unknown>) {
    if (!body.shippingAddress || typeof body.shippingAddress !== 'string') throw new AppError(400, 'Shipping address is required')
    this.shippingAddress = body.shippingAddress as string
  }
}
