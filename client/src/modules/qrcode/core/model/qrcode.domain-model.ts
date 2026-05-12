export namespace QrCodeDomainModel {
  export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

  export type GenerateOptions = {
    size?: number
    errorCorrectionLevel?: ErrorCorrectionLevel
    margin?: number
  }
}
