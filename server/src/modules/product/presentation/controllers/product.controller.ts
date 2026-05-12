import { Request, Response, NextFunction } from 'express'
import { ProductService } from '../../application/services/product.service'
import { CreateProductRequestDto } from '../dto/create-product.request.dto'
import { UpdateProductRequestDto } from '../dto/update-product.request.dto'
import { ProductResponseDto } from '../dto/product.response.dto'

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new CreateProductRequestDto(req.body)
      const product = await this.productService.create(dto as unknown as Record<string, unknown>)
      res.status(201).json({ success: true, data: new ProductResponseDto(product) })
    } catch (error) {
      next(error)
    }
  }

  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await this.productService.getAll()
      res.status(200).json({ success: true, data: products.map((p) => new ProductResponseDto(p)) })
    } catch (error) {
      next(error)
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await this.productService.getBySlug(req.params.slug as string)
      res.status(200).json({ success: true, data: new ProductResponseDto(product) })
    } catch (error) {
      next(error)
    }
  }

  async getFeatured(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await this.productService.getFeatured()
      res.status(200).json({ success: true, data: products.map((p) => new ProductResponseDto(p)) })
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new UpdateProductRequestDto(req.body)
      const product = await this.productService.update(req.params.id as string, dto)
      res.status(200).json({ success: true, data: new ProductResponseDto(product) })
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.productService.delete(req.params.id as string)
      res.status(200).json({ success: true, data: null })
    } catch (error) {
      next(error)
    }
  }
}
