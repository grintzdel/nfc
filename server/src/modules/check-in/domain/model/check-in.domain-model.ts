import type { InteractionType } from '../constants/interaction-type.constant'

export namespace CheckInDomainModel {
  export interface CheckInOverviewDto {
    id: string
    braceletId: string
    eventId: string
    interactionType: InteractionType
    zoneName: Nullable<string>
    targetBraceletId: Nullable<string>
    amount: Nullable<number>
    metadata: Record<string, unknown>
    createdAt: Date
  }

  export type CreateCheckInDto = Omit<CheckInOverviewDto, 'id' | 'createdAt'>
}
