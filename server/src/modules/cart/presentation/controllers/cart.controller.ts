import { Request, Response, NextFunction } from 'express'
import { CartService } from '../../application/services/cart.service'
import { AddToCartRequestDto } from '../dto/add-to-cart.request.dto'
import { UpdateCartItemRequestDto } from '../dto/update-cart-item.request.dto'
import { CartItemResponseDto } from '../dto/cart-item.response.dto'

export class CartController {
  constructor(private readonly cartService: CartService) {}

  async addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new AddToCartRequestDto(req.body)
      const item = await this.cartService.addToCart({ userId: req.user!.userId, ...dto })
      res.status(201).json({ success: true, data: new CartItemResponseDto(item) })
    } catch (error) {
      next(error)
    }
  }

  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await this.cartService.getCart(req.user!.userId)
      res.status(200).json({ success: true, data: items.map((i) => new CartItemResponseDto(i)) })
    } catch (error) {
      next(error)
    }
  }

  async updateCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new UpdateCartItemRequestDto(req.body)
      const item = await this.cartService.updateCartItem(req.params.id as string, dto.quantity)
      res.status(200).json({ success: true, data: new CartItemResponseDto(item) })
    } catch (error) {
      next(error)
    }
  }

  async removeCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.cartService.removeCartItem(req.params.id as string)
      res.status(200).json({ success: true, data: null })
    } catch (error) {
      next(error)
    }
  }

  async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.cartService.clearCart(req.user!.userId)
      res.status(200).json({ success: true, data: null })
    } catch (error) {
      next(error)
    }
  }
}
