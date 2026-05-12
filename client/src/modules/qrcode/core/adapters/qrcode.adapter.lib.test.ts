import { describe, it, expect } from 'vitest'
import { QrCodeLibAdapter } from './qrcode.adapter.lib'

describe('QrCodeLibAdapter', () => {
  it('returns a PNG data URL for a given value', async () => {
    const adapter = new QrCodeLibAdapter()
    const dataUrl = await adapter.generateDataUrl('demo-nfc-001')
    expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true)
    expect(dataUrl.length).toBeGreaterThan(100)
  })

  it('produces identical output for identical input (deterministic)', async () => {
    const adapter = new QrCodeLibAdapter()
    const a = await adapter.generateDataUrl('hello', { size: 128, errorCorrectionLevel: 'M' })
    const b = await adapter.generateDataUrl('hello', { size: 128, errorCorrectionLevel: 'M' })
    expect(a).toBe(b)
  })

  it('honors size option (different size yields different output)', async () => {
    const adapter = new QrCodeLibAdapter()
    const small = await adapter.generateDataUrl('hello', { size: 64 })
    const large = await adapter.generateDataUrl('hello', { size: 512 })
    expect(small).not.toBe(large)
  })
})
