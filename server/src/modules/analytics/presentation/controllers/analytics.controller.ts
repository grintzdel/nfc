import { Request, Response, NextFunction } from 'express'
import { AnalyticsService } from '../../application/services/analytics.service'

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async listActiveEvents(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const data = await this.analyticsService.listActiveEventsWithStats(); res.json({ success: true, data }) }
    catch (e) { next(e) }
  }

  async getParticipantsCount(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const data = await this.analyticsService.getParticipantsCountWithStats(); res.json({ success: true, data }) }
    catch (e) { next(e) }
  }

  async getBraceletsCount(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const data = await this.analyticsService.getBraceletsCountWithStats(); res.json({ success: true, data }) }
    catch (e) { next(e) }
  }

  async getRevenue(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const data = await this.analyticsService.getRevenueWithStats(); res.json({ success: true, data }) }
    catch (e) { next(e) }
  }

  async listActivations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const yearParam = req.query.year
      const year = typeof yearParam === 'string' ? Number(yearParam) : undefined
      const finalYear = year && Number.isFinite(year) ? year : undefined
      const data = await this.analyticsService.listBraceletsActivationByYear(finalYear)
      res.json({ success: true, data })
    } catch (e) { next(e) }
  }

  async listInteractions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const data = await this.analyticsService.listInteractionTypesWithStats(); res.json({ success: true, data }) }
    catch (e) { next(e) }
  }

  async getNextEvent(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const data = await this.analyticsService.getNextEventWithStats(); res.json({ success: true, data }) }
    catch (e) { next(e) }
  }

  async getStock(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const data = await this.analyticsService.getBraceletStockWithStats(); res.json({ success: true, data }) }
    catch (e) { next(e) }
  }

  async getEventPageStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const data = await this.analyticsService.getEventPageStats(); res.json({ success: true, data }) }
    catch (e) { next(e) }
  }

  async getEventDetailStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = req.params.eventId as string
      const data = await this.analyticsService.getEventDetailStats(eventId)
      res.json({ success: true, data })
    } catch (e) { next(e) }
  }
}
