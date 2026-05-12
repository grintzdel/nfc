import { AppError } from '@shared/errors/app.error'

export class UpdateCartItemRequestDto {
  public readonly quantity: number

  constructor(body: Record<string, unknown>) {
    if (!body.quantity || typeof body.quantity !== 'number' || body.quantity < 1)
      throw new AppError(400, 'Quantity must be at least 1')

    this.quantity = body.quantity as number
  }
}
