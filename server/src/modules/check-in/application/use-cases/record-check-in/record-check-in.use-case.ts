import { CheckInEntity } from '../../../domain/entity/check-in.entity'
import { InteractionType } from '../../../domain/constants/interaction-type.constant'
import { CheckInInvalidBraceletStateError } from '../../../domain/errors/check-in.error'
import { ICheckInRepository } from '../../../domain/repository/check-in.repository.interface'
import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'
import { IParticipantRepository } from '@modules/participant/domain/repository/participant.repository.interface'
import { BraceletNotFoundError } from '@modules/bracelet/domain/errors/bracelet.error'
import { ActivateBraceletUseCase } from '@modules/bracelet/application/use-cases/activate-bracelet/activate-bracelet.use-case'

export interface RecordCheckInInput {
  nfcId: string
  eventId: string
  interactionType: InteractionType
  zoneName?: Nullable<string>
  targetNfcId?: Nullable<string>
  amount?: Nullable<number>
  metadata?: Record<string, unknown>
}

export class RecordCheckInUseCase {
  constructor(
    private readonly checkInRepository: ICheckInRepository,
    private readonly braceletRepository: IBraceletRepository,
    private readonly participantRepository: IParticipantRepository,
    private readonly activateBraceletUseCase: ActivateBraceletUseCase,
  ) {}

  async execute(input: RecordCheckInInput): Promise<CheckInEntity> {
    // 1. Resolve bracelet by nfcId
    const bracelet = await this.braceletRepository.findByNfcId(input.nfcId)
    if (!bracelet || bracelet.isDeleted()) throw new BraceletNotFoundError(input.nfcId)

    // 2. Validate bracelet state — must be PRE_ACTIVATED or ACTIVE
    if (bracelet.isInStock() || bracelet.isDisabled()) {
      throw new CheckInInvalidBraceletStateError(input.nfcId, bracelet.status)
    }

    // 3. Resolve targetBraceletId from targetNfcId if present
    let targetBraceletId: Nullable<string> = null
    if (input.targetNfcId) {
      const target = await this.braceletRepository.findByNfcId(input.targetNfcId)
      targetBraceletId = target?.id ?? null
    }

    // 4. Create the check-in
    const checkIn = CheckInEntity.create({
      braceletId: bracelet.id,
      eventId: input.eventId,
      interactionType: input.interactionType,
      zoneName: input.zoneName ?? null,
      targetBraceletId,
      amount: input.amount ?? null,
      metadata: input.metadata ?? {},
    })
    const saved = await this.checkInRepository.create(checkIn)

    // 5. Side-effect: if PRE_ACTIVATED + CHECK_IN → activate bracelet
    if (bracelet.isPreActivated() && input.interactionType === InteractionType.CHECK_IN) {
      try {
        await this.activateBraceletUseCase.execute(bracelet.id)
      } catch (err) {
        console.error('[check-in] failed to activate bracelet', bracelet.id, err)
      }
    }

    // 6. Side-effect: if CHECK_IN → find participant and mark checked in
    if (input.interactionType === InteractionType.CHECK_IN) {
      try {
        const participant = await this.participantRepository.findByBraceletId(bracelet.id)
        if (participant) {
          participant.checkIn()
          await this.participantRepository.update(participant)
        }
      } catch (err) {
        console.error('[check-in] failed to mark participant checked in', bracelet.id, err)
      }
    }

    return saved
  }
}
