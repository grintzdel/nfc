import { AppError } from '@shared/errors/app.error'

export class CreateCategoryRequestDto {
  public readonly name: string
  public readonly slug?: string
  public readonly description?: string

  constructor(body: Record<string, unknown>) {
    if (!body.name || typeof body.name !== 'string') throw new AppError(400, 'Category name is required')
    this.name = body.name
    if (body.slug !== undefined) this.slug = body.slug as string
    if (body.description !== undefined) this.description = body.description as string
  }
}
