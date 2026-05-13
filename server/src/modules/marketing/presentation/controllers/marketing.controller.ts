import type { Request, Response, NextFunction } from 'express'

import type { MarketingService } from '../../application/services/marketing.service'

export class MarketingController {
  constructor(private readonly service: MarketingService) {}

  async getFaqs(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const faqs = await this.service.getFaqs()
      res.status(200).json({ success: true, data: faqs })
    } catch (error) {
      next(error)
    }
  }
}
