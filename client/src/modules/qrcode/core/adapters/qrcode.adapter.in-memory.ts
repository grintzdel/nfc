import type { QrCodeDomainModel } from '../model/qrcode.domain-model'
import type { IQrCodePort } from '../ports/qrcode.port'

/**
 * In-memory adapter for tests and offline scenarios.
 * Returns a deterministic 1x1 PNG data URL keyed on the input value so consumers can
 * still bind it to an `<img>` without invoking a real QR codec.
 */
export class QrCodeInMemoryAdapter implements IQrCodePort {
  generateDataUrl_calledWith: { value: string; options?: QrCodeDomainModel.GenerateOptions }[] = []

  async generateDataUrl(value: string, options?: QrCodeDomainModel.GenerateOptions): Promise<string> {
    this.generateDataUrl_calledWith.push({ value, options })
    // 1x1 transparent PNG; suffix the value as a fragment so equal inputs map to equal outputs.
    const fragment = encodeURIComponent(value).slice(0, 32)
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=#${fragment}`
  }
}
