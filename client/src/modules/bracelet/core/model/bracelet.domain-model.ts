export const BraceletStatus = {
  STOCK: 'stock',
  PRE_ACTIVATED: 'pre_activated',
  ACTIVE: 'active',
  DISABLED: 'disabled',
} as const

export type BraceletStatus = (typeof BraceletStatus)[keyof typeof BraceletStatus]

export namespace BraceletDomainModel {
  export type BraceletOverviewDto = {
    id: string
    nfcId: string
    status: BraceletStatus
    userId: string | null
    eventId: string | null
    productId: string | null
    orderId: string | null
    activatedAt: string | null
    createdAt: string
    updatedAt: string
  }

  export type CreateBraceletDto = {
    nfcId: string
    productId?: string
  }

  export type AssignBraceletDto = {
    userId: string
    eventId: string
  }
}
