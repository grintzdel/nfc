import mongoose, { Schema, Document } from 'mongoose'

export interface CartItemDocument extends Document {
  userId: string
  productId: string
  variantName: string | null
  quantity: number
  createdAt: Date
  updatedAt: Date
}

const cartItemSchema = new Schema<CartItemDocument>(
  {
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true },
    variantName: { type: String, default: null },
    quantity: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
)

export const CartItemModel = mongoose.model<CartItemDocument>('CartItem', cartItemSchema)
