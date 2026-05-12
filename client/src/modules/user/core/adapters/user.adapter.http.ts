import type { HttpClient } from '@/modules/shared/http/http-client'
import type { IUserPort } from '../ports/user.port'
import type { UserDomainModel } from '../model/user.domain-model'

export class UserHttpAdapter implements IUserPort {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(): Promise<UserDomainModel.UserOverviewDto[]> {
    const result = await this.httpClient.get<UserDomainModel.UserOverviewDto[]>('/users')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }
}
