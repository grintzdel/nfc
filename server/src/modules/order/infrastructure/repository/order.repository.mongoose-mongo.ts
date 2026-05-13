import { OrderStatus } from '../../domain/constants/order.constant'
import { OrderEntity } from '../../domain/entity/order.entity'
import { IOrderRepository } from '../../domain/repository/order.repository.interface'
import { OrderModel, OrderDocument } from '../schema/order.schema'

export class OrderRepositoryMongooseMongo implements IOrderRepository {
  private toEntity(doc: OrderDocument): OrderEntity {
    return OrderEntity.fromProps({
      id: doc._id.toString(),
      userId: doc.userId,
      items: doc.items,
      totalAmount: doc.totalAmount,
      status: doc.status as OrderStatus,
      shippingAddress: doc.shippingAddress,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  }

  async findAll(): Promise<OrderEntity[]> {
    const docs = await OrderModel.find().toSorted({ createdAt: -1 })
    return docs.map((doc) => this.toEntity(doc))
  }
  async findById(id: string): Promise<Nullable<OrderEntity>> {
    const doc = await OrderModel.findById(id)
    return doc ? this.toEntity(doc) : null
  }
  async findByUserId(userId: string): Promise<OrderEntity[]> {
    const docs = await OrderModel.find({ userId }).toSorted({ createdAt: -1 })
    return docs.map((doc) => this.toEntity(doc))
  }
  async create(order: OrderEntity): Promise<OrderEntity> {
    const doc = await OrderModel.create({
      userId: order.userId,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
    })
    return this.toEntity(doc)
  }
  async update(order: OrderEntity): Promise<OrderEntity> {
    const json = order.toJSON()
    const doc = await OrderModel.findByIdAndUpdate(order.id, { status: json.status }, { new: true })
    return this.toEntity(doc!)
  }

  async sumRevenueInRange(from: Date, to: Date, statuses: OrderStatus[]): Promise<number> {
    const rows = await OrderModel.aggregate<{ sum: number }>([
      { $match: { status: { $in: statuses }, createdAt: { $gte: from, $lt: to } } },
      { $group: { _id: null, sum: { $sum: '$totalAmount' } } },
    ])
    return rows[0]?.sum ?? 0
  }
}
