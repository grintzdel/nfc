export const SupplyOrderStatus = {
  PENDING: 'pending',
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
} as const

export type SupplyOrderStatus = (typeof SupplyOrderStatus)[keyof typeof SupplyOrderStatus]

export namespace SupplyOrderDomainModel {
  export type SupplyOrderOverviewDto = {
    id: string
    units: number
    orderedAt: string
    estimatedDeliveryDate: string
    status: SupplyOrderStatus
    receivedAt: string | null
    createdAt: string
    updatedAt: string
  }

  export type CreateSupplyOrderDto = {
    units: number
    estimatedDeliveryDate: string
  }
}
