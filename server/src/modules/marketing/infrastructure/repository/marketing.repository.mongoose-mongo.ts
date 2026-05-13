import type { IMarketingRepository } from '../../domain/repository/marketing.repository.interface'
import type { MarketingDomainModel } from '../../domain/model/marketing.domain-model'
import { FaqModel, type FaqDocument } from '../schema/faq.schema'

export class MarketingMongooseRepository implements IMarketingRepository {
  async findAllFaqs(): Promise<MarketingDomainModel.FaqOverviewDto[]> {
    const docs = await FaqModel.find({ deletedAt: null }).sort({ order: 1 }).lean<FaqDocument[]>()
    return docs.map((doc) => this.toDto(doc))
  }

  private toDto(doc: FaqDocument): MarketingDomainModel.FaqOverviewDto {
    return {
      id: String(doc._id),
      question: doc.question,
      answer: doc.answer,
      order: doc.order,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }
  }
}
