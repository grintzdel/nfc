import { AppError } from '@shared/errors/app.error'

export class CreateProductRequestDto {
  public readonly name: string
  public readonly slug?: string
  public readonly description?: string
  public readonly price: number
  public readonly images?: string[]
  public readonly category?: string
  public readonly variants?: { name: string; color: string; priceModifier: number }[]
  public readonly stock?: number
  public readonly featured?: boolean

  constructor(body: Record<string, unknown>) {
    if (!body.name || typeof body.name !== 'string') throw new AppError(400, 'Product name is required')
    if (body.price === undefined || typeof body.price !== 'number' || body.price < 0)
      throw new AppError(400, 'Valid price is required')

    this.name = body.name as string
    this.price = body.price as number
    if (body.slug) this.slug = body.slug as string
    if (body.description) this.description = body.description as string
    if (body.images) this.images = body.images as string[]
    if (body.category) this.category = body.category as string
    if (body.variants) this.variants = body.variants as { name: string; color: string; priceModifier: number }[]
    if (body.stock !== undefined) this.stock = body.stock as number
    if (body.featured !== undefined) this.featured = body.featured as boolean
  }
}
