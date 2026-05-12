import { DomainError } from '@/modules/shared/errors/domain.error'

export class NfcBraceletNotActiveError extends DomainError {
  constructor(nfcId: string) {
    super(`Bracelet ${nfcId} not active`, 'NFC_BRACELET_NOT_ACTIVE')
  }
}
