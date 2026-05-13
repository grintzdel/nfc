import type { HttpClient } from '@/modules/shared/http/http-client'

import { NfcBraceletNotActiveError } from '../errors/nfc.error'
import type { NfcDomainModel } from '../model/nfc.domain-model'
import type { INfcPort } from '../ports/nfc.port'

export class NfcHttpAdapter implements INfcPort {
  constructor(private readonly httpClient: HttpClient) {}

  async getByNfcId(nfcId: string): Promise<NfcDomainModel.NfcTapResponseDto> {
    const result = await this.httpClient.get<NfcDomainModel.NfcTapResponseDto>(`/nfc/${nfcId}`)
    if (result.error) {
      if (result.error.status === 404) throw new NfcBraceletNotActiveError(nfcId)
      throw new Error(result.error.message)
    }
    return result.data.data
  }
}
