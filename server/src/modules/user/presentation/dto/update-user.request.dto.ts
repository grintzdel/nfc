export class UpdateUserRequestDto {
  public readonly firstName?: string
  public readonly lastName?: string
  public readonly email?: string

  constructor(body: Record<string, unknown>) {
    if (body.firstName !== undefined) this.firstName = body.firstName as string
    if (body.lastName !== undefined) this.lastName = body.lastName as string
    if (body.email !== undefined) this.email = (body.email as string).toLowerCase().trim()
  }
}
