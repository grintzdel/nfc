import { Router } from 'express'
import { JwtServiceSecurity } from '@modules/auth/application/services/security/jwt.service-security'
import { createAuthMiddleware, createAdminMiddleware } from '@shared/middlewares/auth.middleware'
import { ProductRepositoryMongooseMongo } from './infrastructure/repository/product.repository.mongoose-mongo'
import { CreateProductUseCase } from './application/use-cases/create-product/create-product.use-case'
import { GetAllProductsUseCase } from './application/use-cases/get-all-products/get-all-products.use-case'
import { GetProductBySlugUseCase } from './application/use-cases/get-product-by-slug/get-product-by-slug.use-case'
import { GetFeaturedProductsUseCase } from './application/use-cases/get-featured-products/get-featured-products.use-case'
import { UpdateProductUseCase } from './application/use-cases/update-product/update-product.use-case'
import { DeleteProductUseCase } from './application/use-cases/delete-product/delete-product.use-case'
import { ProductService } from './application/services/product.service'
import { ProductController } from './presentation/controllers/product.controller'

export function createProductModule(jwtService: JwtServiceSecurity) {
  const repository = new ProductRepositoryMongooseMongo()

  const createUseCase = new CreateProductUseCase(repository)
  const getAllUseCase = new GetAllProductsUseCase(repository)
  const getBySlugUseCase = new GetProductBySlugUseCase(repository)
  const getFeaturedUseCase = new GetFeaturedProductsUseCase(repository)
  const updateUseCase = new UpdateProductUseCase(repository)
  const deleteUseCase = new DeleteProductUseCase(repository)

  const service = new ProductService(
    createUseCase,
    getAllUseCase,
    getBySlugUseCase,
    getFeaturedUseCase,
    updateUseCase,
    deleteUseCase
  )
  const controller = new ProductController(service)

  const authMiddleware = createAuthMiddleware(jwtService)
  const adminMiddleware = createAdminMiddleware()

  const router = Router()

  router.get('/', (req, res, next) => controller.getAll(req, res, next))
  router.get('/featured', (req, res, next) => controller.getFeatured(req, res, next))
  router.get('/:slug', (req, res, next) => controller.getBySlug(req, res, next))
  router.post('/', authMiddleware, adminMiddleware, (req, res, next) => controller.create(req, res, next))
  router.patch('/:id', authMiddleware, adminMiddleware, (req, res, next) => controller.update(req, res, next))
  router.delete('/:id', authMiddleware, adminMiddleware, (req, res, next) => controller.delete(req, res, next))

  return { router, productRepository: repository }
}
