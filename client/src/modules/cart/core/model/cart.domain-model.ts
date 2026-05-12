export namespace CartDomainModel {
  export type CartItemOverviewDto = {
    id: string
    productId: string
    variantName: string | null
    quantity: number
    createdAt: string
  }

  export type AddToCartDto = {
    productId: string
    quantity: number
    variantName?: string
  }

  export type UpdateCartItemDto = {
    quantity: number
  }
}
