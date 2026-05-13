import { ProductCategory } from '../../domain/constants/product.constant'
import { ProductEntity } from '../../domain/entity/product.entity'
import { IProductRepository } from '../../domain/repository/product.repository.interface'
import { ProductModel, ProductDocument } from '../schema/product.schema'

export class ProductRepositoryMongooseMongo implements IProductRepository {
  private toEntity(doc: ProductDocument): ProductEntity {
    return ProductEntity.fromProps({
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      price: doc.price,
      images: doc.images,
      category: doc.category as ProductCategory,
      variants: doc.variants,
      stock: doc.stock,
      featured: doc.featured,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    })
  }

  async findAll(): Promise<ProductEntity[]> {
    const docs = await ProductModel.find({ deletedAt: null }).sort({ createdAt: -1 })
    return docs.map((doc) => this.toEntity(doc))
  }

  async findById(id: string): Promise<Nullable<ProductEntity>> {
    const doc = await ProductModel.findOne({ _id: id, deletedAt: null })
    return doc ? this.toEntity(doc) : null
  }

  async findBySlug(slug: string): Promise<Nullable<ProductEntity>> {
    const doc = await ProductModel.findOne({ slug, deletedAt: null })
    return doc ? this.toEntity(doc) : null
  }

  async findFeatured(): Promise<ProductEntity[]> {
    const docs = await ProductModel.find({ featured: true, deletedAt: null })
    return docs.map((doc) => this.toEntity(doc))
  }

  async create(product: ProductEntity): Promise<ProductEntity> {
    const doc = await ProductModel.create({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      images: product.images,
      category: product.category,
      variants: product.variants,
      stock: product.stock,
      featured: product.featured,
    })
    return this.toEntity(doc)
  }

  async update(product: ProductEntity): Promise<ProductEntity> {
    const json = product.toJSON()
    const doc = await ProductModel.findByIdAndUpdate(
      product.id,
      {
        name: json.name,
        slug: json.slug,
        description: json.description,
        price: json.price,
        images: json.images,
        category: json.category,
        variants: json.variants,
        stock: json.stock,
        featured: json.featured,
        deletedAt: json.deletedAt,
      },
      { new: true }
    )
    return this.toEntity(doc!)
  }

  async delete(id: string): Promise<void> {
    await ProductModel.findByIdAndUpdate(id, { deletedAt: new Date() })
  }
}
