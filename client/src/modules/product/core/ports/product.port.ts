import type { ProductDomainModel } from '../model/product.domain-model'

export interface IProductPort {
  getAll(): Promise<ProductDomainModel.ProductOverviewDto[]>
  getBySlug(slug: string): Promise<ProductDomainModel.ProductOverviewDto>
  getFeatured(): Promise<ProductDomainModel.ProductOverviewDto[]>
}
