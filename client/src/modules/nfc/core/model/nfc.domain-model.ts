import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'

export namespace NfcDomainModel {
  export type BraceletStatus = 'pre_activated' | 'active' | 'disabled' | 'stock'

  export type NfcTapResponseDto = {
    bracelet: { nfcId: string; status: BraceletStatus }
    participant: {
      id: string
      profile: ParticipantDomainModel.ParticipantProfileDto
      checkedInAt: string | null
    }
    event: {
      id: string
      name: string
      slug: string
      venueName: string
      venueAddress: string
      startsAt: string
      endsAt: string
      status: string
    }
  }
}
