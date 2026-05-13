export class AuthResponseDto {
  public readonly token: string
  public readonly user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }

  constructor(data: {
    token: string
    user: { id: string; email: string; firstName: string; lastName: string; role: string }
  }) {
    this.token = data.token
    this.user = data.user
  }
}
