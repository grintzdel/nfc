export namespace ProductDomainModel {
  export type ProductOverviewDto = {
    id: string
    name: string
    slug: string
    description: string
    price: number
    stock: number
    imageUrl: string
    featured: boolean
    createdAt: string
    updatedAt: string
  }
}
