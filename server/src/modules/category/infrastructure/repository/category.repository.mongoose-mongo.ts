import { CategoryEntity } from '../../domain/entity/category.entity'
import { ICategoryRepository } from '../../domain/repository/category.repository.interface'
import { CategoryDocument, CategoryModel } from '../schema/category.schema'

export class CategoryRepositoryMongooseMongo implements ICategoryRepository {
  private toEntity(doc: CategoryDocument): CategoryEntity {
    return CategoryEntity.fromProps({
      id: doc._id!.toString(),
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    })
  }

  async findAll(): Promise<CategoryEntity[]> {
    const docs = await CategoryModel.find({ deletedAt: null }).sort({ name: 1 })
    return docs.map((doc) => this.toEntity(doc))
  }

  async findById(id: string): Promise<Nullable<CategoryEntity>> {
    const doc = await CategoryModel.findOne({ _id: id, deletedAt: null })
    return doc ? this.toEntity(doc) : null
  }

  async findBySlug(slug: string): Promise<Nullable<CategoryEntity>> {
    const doc = await CategoryModel.findOne({ slug, deletedAt: null })
    return doc ? this.toEntity(doc) : null
  }

  async create(category: CategoryEntity): Promise<CategoryEntity> {
    const doc = await CategoryModel.create({
      name: category.name,
      slug: category.slug,
      description: category.description,
    })
    return this.toEntity(doc)
  }

  async update(category: CategoryEntity): Promise<CategoryEntity> {
    const json = category.toJSON()
    const doc = await CategoryModel.findByIdAndUpdate(
      category.id,
      {
        name: json.name,
        slug: json.slug,
        description: json.description,
        deletedAt: json.deletedAt,
      },
      { new: true }
    )
    return this.toEntity(doc!)
  }

  async delete(id: string): Promise<void> {
    await CategoryModel.findByIdAndUpdate(id, { deletedAt: new Date() })
  }
}
