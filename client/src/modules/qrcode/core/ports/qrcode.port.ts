import type { QrCodeDomainModel } from '../model/qrcode.domain-model'

export interface IQrCodePort {
  generateDataUrl(value: string, options?: QrCodeDomainModel.GenerateOptions): Promise<string>
}
