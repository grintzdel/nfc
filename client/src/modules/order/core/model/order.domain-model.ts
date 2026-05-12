export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export namespace OrderDomainModel {
  export type OrderItemDto = {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
  }

  export type OrderOverviewDto = {
    id: string
    userId: string
    items: OrderItemDto[]
    totalAmount: number
    status: OrderStatus
    shippingAddress: string
    createdAt: string
  }

  export type CreateOrderDto = {
    shippingAddress: string
  }
}
