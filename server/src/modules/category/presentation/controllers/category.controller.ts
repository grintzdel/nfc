import { Request, Response, NextFunction } from 'express'

import { CategoryService } from '../../application/services/category.service'
import { CategoryResponseDto } from '../dto/category.response.dto'
import { CreateCategoryRequestDto } from '../dto/create-category.request.dto'
import { UpdateCategoryRequestDto } from '../dto/update-category.request.dto'

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new CreateCategoryRequestDto(req.body)
      const category = await this.categoryService.create(dto as unknown as Record<string, unknown>)
      res.status(201).json({ success: true, data: new CategoryResponseDto(category) })
    } catch (error) {
      next(error)
    }
  }

  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.categoryService.getAll()
      res.status(200).json({ success: true, data: categories.map((c) => new CategoryResponseDto(c)) })
    } catch (error) {
      next(error)
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await this.categoryService.getBySlug(req.params.slug as string)
      res.status(200).json({ success: true, data: new CategoryResponseDto(category) })
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new UpdateCategoryRequestDto(req.body)
      const category = await this.categoryService.update(req.params.id as string, dto)
      res.status(200).json({ success: true, data: new CategoryResponseDto(category) })
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.categoryService.delete(req.params.id as string)
      res.status(200).json({ success: true, data: null })
    } catch (error) {
      next(error)
    }
  }
}
