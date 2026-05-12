import type { ProductDomainModel } from '../model/product.domain-model'

export interface IProductPort {
  getAll(): Promise<ProductDomainModel.ProductOverviewDto[]>
  getBySlug(slug: string): Promise<ProductDomainModel.ProductOverviewDto>
  getFeatured(): Promise<ProductDomainModel.ProductOverviewDto[]>
  create(dto: ProductDomainModel.CreateProductDto): Promise<ProductDomainModel.ProductOverviewDto>
  update(id: string, dto: ProductDomainModel.UpdateProductDto): Promise<ProductDomainModel.ProductOverviewDto>
  delete(id: string): Promise<void>
}
