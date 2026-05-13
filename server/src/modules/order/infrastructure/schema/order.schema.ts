import mongoose, { Schema, Document } from 'mongoose'

export interface OrderDocument extends Document {
  userId: string
  items: { productId: string; productName: string; quantity: number; unitPrice: number }[]
  totalAmount: number
  status: string
  shippingAddress: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
)

const orderSchema = new Schema<OrderDocument>(
  {
    userId: { type: String, required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    shippingAddress: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const OrderModel = mongoose.model<OrderDocument>('Order', orderSchema)
