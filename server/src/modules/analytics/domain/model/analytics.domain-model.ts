import type { EventEntityProps } from '@modules/event/domain/entity/event.entity'
import type { StockLevel } from '../constants/stock-level.constant'
import type { InteractionType } from '@modules/check-in/domain/constants/interaction-type.constant'

export namespace AnalyticsDomainModel {
  export interface ActiveEventsStatsDto {
    events: EventEntityProps[]
    count: number
    diffVsLastMonth: number
  }
  export interface CountWithRateDto {
    count: number
    rateVsLastMonth: Nullable<number>
  }
  export interface RevenueWithRateDto {
    revenue: number
    rateVsLastMonth: Nullable<number>
  }
  export interface MonthlyActivationDto {
    month: number
    monthName: string
    activations: number
  }
  export interface ActivationsByYearDto {
    year: number
    months: MonthlyActivationDto[]
  }
  export interface InteractionTypeStatDto {
    type: InteractionType
    typeLabel: string
    scansCount: number
    sharePercent: number
  }
  export interface InteractionsStatsDto {
    total: number
    types: InteractionTypeStatDto[]
  }
  export interface NextEventStatsDto {
    event: Nullable<{
      id: string
      name: string
      city: string
      staffCount: number
      startsAt: Date
      endsAt: Date
      daysUntil: number
      braceletsOrdered: number
      braceletsPreActivated: number
      fillRate: number
    }>
  }
  export interface BraceletStockStatsDto {
    current: number
    maxCapacity: number
    fillPercent: number
    level: StockLevel
    pendingOrder: Nullable<{
      units: number
      estimatedDeliveryDate: Date
    }>
  }
  export interface EventPageStatsDto {
    totalEvents: number
    diffVsLastMonth: number
    upcomingIn30Days: number
    inProgressCount: number
    completedThisYear: number
    successRate: number
  }
  export interface EventDetailStatsDto {
    participantCount: number
    capacity: number
    capacityFillRate: number
    braceletsAttachedCount: number
    braceletsActiveCount: number
    checkInCount: number
    uniqueParticipantsCheckedIn: number
    lastCheckInAt: Nullable<string>
  }
}
