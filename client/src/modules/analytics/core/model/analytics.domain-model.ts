import type { EventDomainModel } from '@/modules/event/core/model/event.domain-model'
import type { InteractionType } from '@/modules/check-in/core/model/check-in.domain-model'

export const StockLevel = {
  LOW: 'low',
  MID: 'mid',
  HIGH: 'high',
} as const

export type StockLevel = (typeof StockLevel)[keyof typeof StockLevel]

export namespace AnalyticsDomainModel {
  export type ActiveEventsStatsDto = {
    events: EventDomainModel.EventOverviewDto[]
    count: number
    diffVsLastMonth: number
  }

  export type CountWithRateDto = {
    count: number
    rateVsLastMonth: number | null
  }

  export type RevenueWithRateDto = {
    revenue: number
    rateVsLastMonth: number | null
  }

  export type MonthlyActivationDto = {
    month: number
    monthName: string
    activations: number
  }

  export type ActivationsByYearDto = {
    year: number
    months: MonthlyActivationDto[]
  }

  export type InteractionTypeStatDto = {
    type: InteractionType
    typeLabel: string
    scansCount: number
    sharePercent: number
  }

  export type InteractionsStatsDto = {
    total: number
    types: InteractionTypeStatDto[]
  }

  export type NextEventStatsDto = {
    event: {
      id: string
      name: string
      city: string
      staffCount: number
      startsAt: string
      endsAt: string
      daysUntil: number
      braceletsOrdered: number
      braceletsPreActivated: number
      fillRate: number
    } | null
  }

  export type EventPageStatsDto = {
    totalEvents: number
    diffVsLastMonth: number
    upcomingIn30Days: number
    inProgressCount: number
    completedThisYear: number
    successRate: number
  }

  export type BraceletStockStatsDto = {
    current: number
    maxCapacity: number
    fillPercent: number
    level: StockLevel
    pendingOrder: {
      units: number
      estimatedDeliveryDate: string
    } | null
  }
}
