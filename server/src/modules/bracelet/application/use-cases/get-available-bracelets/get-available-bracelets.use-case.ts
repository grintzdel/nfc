import { BraceletEntity } from '../../../domain/entity/bracelet.entity'
import { BraceletStatus } from '../../../domain/constants/bracelet-status.constant'
import { IBraceletRepository } from '../../../domain/repository/bracelet.repository.interface'
import { IParticipantRepository } from '@modules/participant/domain/repository/participant.repository.interface'

const MAX_RESULTS = 100

export class GetAvailableBraceletsUseCase {
  constructor(
    private readonly braceletRepository: IBraceletRepository,
    private readonly participantRepository: IParticipantRepository,
  ) {}

  async execute({ eventId }: { eventId: string }): Promise<BraceletEntity[]> {
    const [preActivated, participants] = await Promise.all([
      this.braceletRepository.findAllByEventIdAndStatus(eventId, BraceletStatus.PRE_ACTIVATED),
      this.participantRepository.findAllByEventId(eventId),
    ])

    const attachedIds = new Set(
      participants.map((p) => p.braceletId).filter((id): id is string => id !== null),
    )

    const available = preActivated.filter((b) => !attachedIds.has(b.id))
    return available.slice(0, MAX_RESULTS)
  }
}
