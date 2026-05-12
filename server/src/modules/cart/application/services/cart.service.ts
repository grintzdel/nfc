import { AddToCartUseCase } from '../use-cases/add-to-cart/add-to-cart.use-case'
import { GetCartUseCase } from '../use-cases/get-cart/get-cart.use-case'
import { UpdateCartItemUseCase } from '../use-cases/update-cart-item/update-cart-item.use-case'
import { RemoveCartItemUseCase } from '../use-cases/remove-cart-item/remove-cart-item.use-case'
import { ClearCartUseCase } from '../use-cases/clear-cart/clear-cart.use-case'

export class CartService {
  constructor(
    private readonly addToCartUseCase: AddToCartUseCase,
    private readonly getCartUseCase: GetCartUseCase,
    private readonly updateCartItemUseCase: UpdateCartItemUseCase,
    private readonly removeCartItemUseCase: RemoveCartItemUseCase,
    private readonly clearCartUseCase: ClearCartUseCase
  ) {}

  addToCart(input: { userId: string; productId: string; variantName?: string; quantity: number }) {
    return this.addToCartUseCase.execute(input)
  }

  getCart(userId: string) {
    return this.getCartUseCase.execute(userId)
  }

  updateCartItem(id: string, quantity: number) {
    return this.updateCartItemUseCase.execute(id, quantity)
  }

  removeCartItem(id: string) {
    return this.removeCartItemUseCase.execute(id)
  }

  clearCart(userId: string) {
    return this.clearCartUseCase.execute(userId)
  }
}
