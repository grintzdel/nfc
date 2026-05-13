import mongoose, { Schema, Document } from 'mongoose'

export interface CategoryDocument extends Document {
  name: string
  slug: string
  description: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const CategoryModel = mongoose.model<CategoryDocument>('Category', categorySchema)
