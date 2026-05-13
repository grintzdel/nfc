import { BraceletStatus } from '../../../domain/constants/bracelet-status.constant'
import { BraceletEntity } from '../../../domain/entity/bracelet.entity'
import { IBraceletRepository } from '../../../domain/repository/bracelet.repository.interface'

export class GetPaginatedBraceletsUseCase {
  constructor(private readonly braceletRepository: IBraceletRepository) {}

  async execute(params: {
    page: number
    limit: number
    status?: BraceletStatus
    search?: string
  }): Promise<PaginatedResult<BraceletEntity>> {
    const page = Math.max(1, params.page)
    const limit = Math.max(1, Math.min(100, params.limit))
    return this.braceletRepository.findPaginated({ page, limit, status: params.status, search: params.search })
  }
}
