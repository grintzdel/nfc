import { CreateProductUseCase } from '../use-cases/create-product/create-product.use-case'
import { DeleteProductUseCase } from '../use-cases/delete-product/delete-product.use-case'
import { GetAllProductsUseCase } from '../use-cases/get-all-products/get-all-products.use-case'
import { GetFeaturedProductsUseCase } from '../use-cases/get-featured-products/get-featured-products.use-case'
import { GetProductBySlugUseCase } from '../use-cases/get-product-by-slug/get-product-by-slug.use-case'
import { UpdateProductUseCase } from '../use-cases/update-product/update-product.use-case'

export class ProductService {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getAllProductsUseCase: GetAllProductsUseCase,
    private readonly getProductBySlugUseCase: GetProductBySlugUseCase,
    private readonly getFeaturedProductsUseCase: GetFeaturedProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase
  ) {}

  create(input: Record<string, unknown>) {
    return this.createProductUseCase.execute(input)
  }

  getAll() {
    return this.getAllProductsUseCase.execute()
  }

  getBySlug(slug: string) {
    return this.getProductBySlugUseCase.execute(slug)
  }

  getFeatured() {
    return this.getFeaturedProductsUseCase.execute()
  }

  update(id: string, input: Record<string, unknown>) {
    return this.updateProductUseCase.execute(id, input)
  }

  delete(id: string) {
    return this.deleteProductUseCase.execute(id)
  }
}
