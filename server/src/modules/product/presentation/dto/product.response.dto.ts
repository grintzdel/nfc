import { ProductEntity } from '../../domain/entity/product.entity'

export class ProductResponseDto {
  public readonly id: string
  public readonly name: string
  public readonly slug: string
  public readonly description: string
  public readonly price: number
  public readonly images: string[]
  public readonly category: string
  public readonly variants: { name: string; color: string; priceModifier: number }[]
  public readonly stock: number
  public readonly featured: boolean
  public readonly createdAt: Date

  constructor(entity: ProductEntity) {
    this.id = entity.id
    this.name = entity.name
    this.slug = entity.slug
    this.description = entity.description
    this.price = entity.price
    this.images = entity.images
    this.category = entity.category
    this.variants = entity.variants
    this.stock = entity.stock
    this.featured = entity.featured
    this.createdAt = entity.createdAt
  }
}
