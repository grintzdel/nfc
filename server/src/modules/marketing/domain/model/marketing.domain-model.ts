export namespace MarketingDomainModel {
  export type FaqOverviewDto = {
    id: string
    question: string
    answer: string
    order: number
    createdAt: Date
    updatedAt: Date
  }
}
