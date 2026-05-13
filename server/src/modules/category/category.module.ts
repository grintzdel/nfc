import { JwtServiceSecurity } from '@modules/auth/application/services/security/jwt.service-security'
import { IProductRepository } from '@modules/product/domain/repository/product.repository.interface'
import { createAdminMiddleware, createAuthMiddleware } from '@shared/middlewares/auth.middleware'
import { Router } from 'express'

import { CategoryService } from './application/services/category.service'
import { CreateCategoryUseCase } from './application/use-cases/create-category/create-category.use-case'
import { DeleteCategoryUseCase } from './application/use-cases/delete-category/delete-category.use-case'
import { GetAllCategoriesUseCase } from './application/use-cases/get-all-categories/get-all-categories.use-case'
import { GetCategoryBySlugUseCase } from './application/use-cases/get-category-by-slug/get-category-by-slug.use-case'
import { UpdateCategoryUseCase } from './application/use-cases/update-category/update-category.use-case'
import { ICategoryRepository } from './domain/repository/category.repository.interface'
import { CategoryRepositoryMongooseMongo } from './infrastructure/repository/category.repository.mongoose-mongo'
import { CategoryController } from './presentation/controllers/category.controller'

export function createCategoryModule(jwtService: JwtServiceSecurity): {
  router: Router
  categoryRepository: ICategoryRepository
  attachDeps: (deps: { productRepository: IProductRepository }) => void
} {
  const repository = new CategoryRepositoryMongooseMongo()

  const createUseCase = new CreateCategoryUseCase(repository)
  const getAllUseCase = new GetAllCategoriesUseCase(repository)
  const getBySlugUseCase = new GetCategoryBySlugUseCase(repository)
  const updateUseCase = new UpdateCategoryUseCase(repository)

  // Delete needs the product repository to check usage. We wire a placeholder
  // and replace it via attachDeps once create-app has built the product module.
  let deleteUseCase = new DeleteCategoryUseCase(repository, {
    async countByCategory() {
      throw new Error('Category module productRepository not attached yet')
    },
  } as unknown as IProductRepository)

  const service = new CategoryService(createUseCase, getAllUseCase, getBySlugUseCase, updateUseCase, deleteUseCase)
  const controller = new CategoryController(service)

  const authMiddleware = createAuthMiddleware(jwtService)
  const adminMiddleware = createAdminMiddleware()

  const router = Router()
  router.get('/', (req, res, next) => controller.getAll(req, res, next))
  router.get('/:slug', (req, res, next) => controller.getBySlug(req, res, next))
  router.post('/', authMiddleware, adminMiddleware, (req, res, next) => controller.create(req, res, next))
  router.patch('/:id', authMiddleware, adminMiddleware, (req, res, next) => controller.update(req, res, next))
  router.delete('/:id', authMiddleware, adminMiddleware, (req, res, next) => controller.delete(req, res, next))

  function attachDeps(deps: { productRepository: IProductRepository }): void {
    deleteUseCase = new DeleteCategoryUseCase(repository, deps.productRepository)
    service.attachDelete(deleteUseCase)
  }

  return { router, categoryRepository: repository, attachDeps }
}
