import { ProductNotFoundError } from '../../../domain/errors/product.error'
import { IProductRepository } from '../../../domain/repository/product.repository.interface'

export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.findById(id)
    if (!product) throw new ProductNotFoundError(id)
    product.softDelete()
    await this.productRepository.update(product)
  }
}
