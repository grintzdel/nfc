import type { UserDomainModel } from '../model/user.domain-model'

export interface IUserPort {
  getAll(): Promise<UserDomainModel.UserOverviewDto[]>
}
