export const OrderStatus = { PENDING: 'pending', CONFIRMED: 'confirmed', SHIPPED: 'shipped', DELIVERED: 'delivered', CANCELLED: 'cancelled' } as const
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]
