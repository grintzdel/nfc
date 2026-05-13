import { Router } from 'express'
import { MarketingMongooseRepository } from './infrastructure/repository/marketing.repository.mongoose-mongo'
import { GetFaqsUseCase } from './application/use-cases/get-faqs/get-faqs.use-case'
import { MarketingService } from './application/services/marketing.service'
import { MarketingController } from './presentation/controllers/marketing.controller'

export function createMarketingModule() {
  const repository = new MarketingMongooseRepository()
  const getFaqsUseCase = new GetFaqsUseCase(repository)
  const service = new MarketingService(getFaqsUseCase)
  const controller = new MarketingController(service)

  const router = Router()
  router.get('/faqs', (req, res, next) => controller.getFaqs(req, res, next))

  return { router }
}
