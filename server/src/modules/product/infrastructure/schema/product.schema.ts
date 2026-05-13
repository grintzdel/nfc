import mongoose, { Schema, Document } from 'mongoose'

export interface ProductDocument extends Document {
  name: string
  slug: string
  description: string
  price: number
  images: string[]
  category: string
  variants: { name: string; color: string; priceModifier: number }[]
  stock: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

const productVariantSchema = new Schema(
  {
    name: { type: String, required: true },
    color: { type: String, required: true },
    priceModifier: { type: Number, default: 0 },
  },
  { _id: false }
)

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    images: { type: [String], default: [] },
    category: { type: String, default: 'bracelet' },
    variants: { type: [productVariantSchema], default: [] },
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const ProductModel = mongoose.model<ProductDocument>('Product', productSchema)
