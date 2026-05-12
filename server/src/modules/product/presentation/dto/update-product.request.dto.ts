export class UpdateProductRequestDto {
  [key: string]: unknown

  constructor(body: Record<string, unknown>) {
    if (body.name !== undefined) this.name = body.name
    if (body.slug !== undefined) this.slug = body.slug
    if (body.description !== undefined) this.description = body.description
    if (body.price !== undefined) this.price = body.price
    if (body.images !== undefined) this.images = body.images
    if (body.category !== undefined) this.category = body.category
    if (body.variants !== undefined) this.variants = body.variants
    if (body.stock !== undefined) this.stock = body.stock
    if (body.featured !== undefined) this.featured = body.featured
  }
}
