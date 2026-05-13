import { BraceletNotFoundError } from '../../../domain/errors/bracelet.error'
import { IBraceletRepository } from '../../../domain/repository/bracelet.repository.interface'

export class DeleteBraceletUseCase {
  constructor(private readonly braceletRepository: IBraceletRepository) {}

  async execute(id: string): Promise<void> {
    const bracelet = await this.braceletRepository.findById(id)
    if (!bracelet || bracelet.isDeleted()) throw new BraceletNotFoundError(id)
    await this.braceletRepository.softDelete(id)
  }
}
