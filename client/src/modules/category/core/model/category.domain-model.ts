export namespace CategoryDomainModel {
  export type CategoryOverviewDto = {
    id: string
    name: string
    slug: string
    description: string
    createdAt: string
    updatedAt: string
  }

  export type CreateCategoryDto = {
    name: string
    slug?: string
    description?: string
  }

  export type UpdateCategoryDto = Partial<CreateCategoryDto>
}
