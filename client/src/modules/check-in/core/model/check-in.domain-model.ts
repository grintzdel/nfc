export const InteractionType = {
  CHECK_IN: 'check_in',
  NETWORKING: 'networking',
  VOTE: 'vote',
  CASHLESS: 'cashless',
} as const

export type InteractionType = (typeof InteractionType)[keyof typeof InteractionType]

export namespace CheckInDomainModel {
  export type CheckInOverviewDto = {
    id: string
    braceletId: string
    eventId: string
    interactionType: InteractionType
    zoneName: string | null
    targetBraceletId: string | null
    amount: number | null
    metadata: Record<string, unknown>
    createdAt: string
  }

  export type RecordCheckInDto = {
    nfcId: string
    eventId: string
    interactionType: InteractionType
    zoneName?: string
    targetNfcId?: string
    amount?: number
    metadata?: Record<string, unknown>
  }
}
