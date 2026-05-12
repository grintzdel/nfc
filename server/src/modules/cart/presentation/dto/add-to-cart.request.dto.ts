import { AppError } from '@shared/errors/app.error'

export class AddToCartRequestDto {
  public readonly productId: string
  public readonly variantName?: string
  public readonly quantity: number

  constructor(body: Record<string, unknown>) {
    if (!body.productId || typeof body.productId !== 'string') throw new AppError(400, 'Product ID is required')

    this.productId = body.productId as string
    this.variantName = body.variantName as string | undefined
    this.quantity = typeof body.quantity === 'number' && body.quantity >= 1 ? body.quantity : 1
  }
}
