import type { HttpClient } from '@/modules/shared/http/http-client'

import type { CategoryDomainModel } from '../model/category.domain-model'
import type { ICategoryPort } from '../ports/category.port'

export class CategoryHttpAdapter implements ICategoryPort {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(): Promise<CategoryDomainModel.CategoryOverviewDto[]> {
    const result = await this.httpClient.get<CategoryDomainModel.CategoryOverviewDto[]>('/categories')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getBySlug(slug: string): Promise<CategoryDomainModel.CategoryOverviewDto> {
    const result = await this.httpClient.get<CategoryDomainModel.CategoryOverviewDto>(`/categories/${slug}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async create(dto: CategoryDomainModel.CreateCategoryDto): Promise<CategoryDomainModel.CategoryOverviewDto> {
    const result = await this.httpClient.post<CategoryDomainModel.CategoryOverviewDto>('/categories', dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async update(
    id: string,
    dto: CategoryDomainModel.UpdateCategoryDto
  ): Promise<CategoryDomainModel.CategoryOverviewDto> {
    const result = await this.httpClient.patch<CategoryDomainModel.CategoryOverviewDto>(`/categories/${id}`, dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async delete(id: string): Promise<void> {
    const result = await this.httpClient.delete(`/categories/${id}`)
    if (result.error) throw new Error(result.error.message)
  }
}
