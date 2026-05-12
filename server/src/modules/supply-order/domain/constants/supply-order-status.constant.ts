export const SupplyOrderStatus = {
  PENDING: 'pending',
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
} as const

export type SupplyOrderStatus = (typeof SupplyOrderStatus)[keyof typeof SupplyOrderStatus]
