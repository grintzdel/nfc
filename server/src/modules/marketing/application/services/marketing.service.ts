import type { GetFaqsUseCase } from '../use-cases/get-faqs/get-faqs.use-case'

export class MarketingService {
  constructor(private readonly getFaqsUseCase: GetFaqsUseCase) {}

  getFaqs() {
    return this.getFaqsUseCase.execute()
  }
}
