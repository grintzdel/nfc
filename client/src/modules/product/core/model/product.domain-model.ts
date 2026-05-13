export namespace ProductDomainModel {
  export type ProductVariantDto = {
    name: string
    color: string
    priceModifier: number
  }

  export type ProductOverviewDto = {
    id: string
    name: string
    slug: string
    description: string
    price: number
    stock: number
    imageUrl: string
    featured: boolean
    category: string
    createdAt: string
    updatedAt: string
  }

  export type CreateProductDto = {
    name: string
    price: number
    slug?: string
    description?: string
    images?: string[]
    category?: string
    variants?: ProductVariantDto[]
    stock?: number
    featured?: boolean
  }

  export type UpdateProductDto = Partial<CreateProductDto>
}
