import { Request, Response, NextFunction } from 'express'

import { OrderService } from '../../application/services/order.service'
import { CreateOrderRequestDto } from '../dto/create-order.request.dto'
import { OrderResponseDto } from '../dto/order.response.dto'
import { UpdateOrderStatusRequestDto } from '../dto/update-order-status.request.dto'

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new CreateOrderRequestDto(req.body)
      const order = await this.orderService.create({ userId: req.user!.userId, shippingAddress: dto.shippingAddress })
      res.status(201).json({ success: true, data: new OrderResponseDto(order) })
    } catch (error) {
      next(error)
    }
  }
  async getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await this.orderService.getMyOrders(req.user!.userId)
      res.status(200).json({ success: true, data: orders.map((o) => new OrderResponseDto(o)) })
    } catch (error) {
      next(error)
    }
  }
  async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await this.orderService.getOrderById(req.params.id as string)
      res.status(200).json({ success: true, data: new OrderResponseDto(order) })
    } catch (error) {
      next(error)
    }
  }
  async getAllOrders(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await this.orderService.getAllOrders()
      res.status(200).json({ success: true, data: orders.map((o) => new OrderResponseDto(o)) })
    } catch (error) {
      next(error)
    }
  }
  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new UpdateOrderStatusRequestDto(req.body)
      const order = await this.orderService.updateStatus(req.params.id as string, dto.status)
      res.status(200).json({ success: true, data: new OrderResponseDto(order) })
    } catch (error) {
      next(error)
    }
  }
}
