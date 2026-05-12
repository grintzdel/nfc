import type { NfcDomainModel } from '../model/nfc.domain-model'

export interface INfcPort {
  getByNfcId(nfcId: string): Promise<NfcDomainModel.NfcTapResponseDto>
}
