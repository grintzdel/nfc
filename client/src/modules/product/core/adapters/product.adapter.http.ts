import type { HttpClient } from '@/modules/shared/http/http-client'
import type { IProductPort } from '../ports/product.port'
import type { ProductDomainModel } from '../model/product.domain-model'

export class ProductHttpAdapter implements IProductPort {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(): Promise<ProductDomainModel.ProductOverviewDto[]> {
    const result = await this.httpClient.get<ProductDomainModel.ProductOverviewDto[]>('/products')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getBySlug(slug: string): Promise<ProductDomainModel.ProductOverviewDto> {
    const result = await this.httpClient.get<ProductDomainModel.ProductOverviewDto>(`/products/${slug}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getFeatured(): Promise<ProductDomainModel.ProductOverviewDto[]> {
    const result = await this.httpClient.get<ProductDomainModel.ProductOverviewDto[]>('/products/featured')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }
}
