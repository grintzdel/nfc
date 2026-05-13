import QRCode from 'qrcode'

import type { QrCodeDomainModel } from '../model/qrcode.domain-model'
import type { IQrCodePort } from '../ports/qrcode.port'

export class QrCodeLibAdapter implements IQrCodePort {
  async generateDataUrl(value: string, options?: QrCodeDomainModel.GenerateOptions): Promise<string> {
    return QRCode.toDataURL(value, {
      width: options?.size ?? 256,
      errorCorrectionLevel: options?.errorCorrectionLevel ?? 'M',
      margin: options?.margin ?? 1,
    })
  }
}
