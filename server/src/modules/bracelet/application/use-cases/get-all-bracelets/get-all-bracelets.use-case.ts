import { BraceletStatus } from '../../../domain/constants/bracelet-status.constant'
import { BraceletEntity } from '../../../domain/entity/bracelet.entity'
import { IBraceletRepository } from '../../../domain/repository/bracelet.repository.interface'

export class GetAllBraceletsUseCase {
  constructor(private readonly braceletRepository: IBraceletRepository) {}

  async execute(status?: BraceletStatus): Promise<BraceletEntity[]> {
    if (status) return this.braceletRepository.findAllByStatus(status)
    return this.braceletRepository.findAll()
  }
}
