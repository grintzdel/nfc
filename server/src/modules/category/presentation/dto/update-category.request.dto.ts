export class UpdateCategoryRequestDto {
  [key: string]: unknown

  constructor(body: Record<string, unknown>) {
    if (body.name !== undefined) this.name = body.name
    if (body.slug !== undefined) this.slug = body.slug
    if (body.description !== undefined) this.description = body.description
  }
}
